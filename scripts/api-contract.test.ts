import { spawn, spawnSync } from "child_process";

const port = Number(process.env.TEST_PORT ?? 3101);
const baseUrl = `http://127.0.0.1:${port}`;

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

type Listing = {
  id: string;
  quantity: number;
  mode: "SALE" | "DONATION";
  status: string;
  merchantId: string;
  title: string;
};

type LoginUser = {
  id: string;
  role: "CUSTOMER" | "MERCHANT" | "CHARITY" | "ADMIN";
};

type Order = {
  id: string;
  pickupCode: string;
  status: string;
  listing: Listing;
};

type Claim = {
  id: string;
  pickupCode: string;
  status: string;
  listing: Listing;
};

type Upload = {
  url: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function startServer() {
  const child = spawn("pnpm", ["exec", "next", "start", "-p", String(port)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "api-contract-test-secret-do-not-use-in-production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    try {
      const response = await fetch(`${baseUrl}/api/listings`);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error("Server did not become ready in time");
}

async function request<T>(
  path: string,
  init?: RequestInit & { cookie?: string },
) {
  const headers = new Headers(init?.headers);

  if (init?.cookie) {
    headers.set("Cookie", init.cookie);
  }

  if (
    init?.method &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(init.method.toUpperCase()) &&
    !headers.has("x-rescuefood-csrf")
  ) {
    headers.set("x-rescuefood-csrf", "rescuefood-client");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  return {
    cookie: response.headers.get("set-cookie") ?? "",
    ok: response.ok,
    payload,
    status: response.status,
  };
}

async function login(email: string) {
  const response = await request<LoginUser>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: "password123",
    }),
  });

  assert(response.ok, `Login failed for ${email}`);
  assert(response.payload.data, `Login returned no data for ${email}`);

  return response.cookie.split(";")[0];
}

async function main() {
  run("pnpm", ["db:seed"]);

  const server = startServer();

  try {
    await waitForServer();

    const unauthenticatedOrder = await request("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId: "missing" }),
    });
    assert(
      unauthenticatedOrder.status === 401,
      "Unauthenticated order should return 401",
    );

    const listingsResponse = await request<Listing[]>("/api/listings");
    assert(listingsResponse.ok, "Listings request should succeed");
    const listings = listingsResponse.payload.data ?? [];
    const saleListing = listings.find((listing) => listing.mode === "SALE");
    const donationListing = listings.find(
      (listing) => listing.mode === "DONATION",
    );
    assert(saleListing, "Seed sale listing should exist");
    assert(donationListing, "Seed donation listing should exist");

    const customerCookie = await login("customer@rescuefood.local");
    const orderResponse = await request<Order>("/api/orders", {
      method: "POST",
      cookie: customerCookie,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId: saleListing.id, quantity: 2 }),
    });
    assert(orderResponse.ok, "Customer order should succeed");
    const order = orderResponse.payload.data;
    assert(order, "Order response should include data");
    assert(order.pickupCode, "Order should include code");
    assert(
      order.listing.quantity === saleListing.quantity - 2,
      "Order should decrement sale listing stock",
    );

    const charityCookie = await login("charity@rescuefood.local");
    const claimResponse = await request<Claim>("/api/donation-claims", {
      method: "POST",
      cookie: charityCookie,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listingId: donationListing.id, quantity: 3 }),
    });
    assert(claimResponse.ok, "Charity claim should succeed");
    const claim = claimResponse.payload.data;
    assert(claim, "Claim response should include data");
    assert(claim.pickupCode, "Claim should include code");
    assert(
      claim.listing.quantity === donationListing.quantity - 3,
      "Claim should decrement donation listing stock",
    );

    const merchantCookie = await login("merchant@rescuefood.local");
    const confirmOrderResponse = await request<Order>(
      `/api/orders/${order.id}`,
      {
        method: "PATCH",
        cookie: merchantCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      },
    );
    assert(confirmOrderResponse.ok, "Merchant order confirm should succeed");
    assert(
      confirmOrderResponse.payload.data?.status === "CONFIRMED",
      "Order should become CONFIRMED",
    );

    const readyOrderResponse = await request<Order>(
      `/api/orders/${order.id}`,
      {
        method: "PATCH",
        cookie: merchantCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "READY_FOR_PICKUP" }),
      },
    );
    assert(readyOrderResponse.ok, "Merchant order ready should succeed");

    const completeClaimResponse = await request<Claim>(
      `/api/donation-claims/${claim.id}`,
      {
        method: "PATCH",
        cookie: merchantCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      },
    );
    assert(completeClaimResponse.ok, "Merchant claim approve should succeed");
    assert(
      completeClaimResponse.payload.data?.status === "APPROVED",
      "Claim should become APPROVED",
    );

    const uploadData = new FormData();
    uploadData.append(
      "file",
      new Blob(["fake image"], { type: "image/png" }),
      "api-test.png",
    );
    const uploadResponse = await request<Upload>("/api/uploads", {
      method: "POST",
      cookie: merchantCookie,
      body: uploadData,
    });
    assert(uploadResponse.ok, "Merchant image upload should succeed");
    assert(
      uploadResponse.payload.data?.url.startsWith("/uploads/"),
      "Upload should return a public upload URL",
    );

    const updateListingResponse = await request<Listing>(
      `/api/listings/${saleListing.id}`,
      {
        method: "PATCH",
        cookie: merchantCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Updated API Test Listing",
          status: "ACTIVE",
        }),
      },
    );
    assert(updateListingResponse.ok, "Merchant listing update should succeed");
    assert(
      updateListingResponse.payload.data?.title === "Updated API Test Listing",
      "Listing title should update",
    );

    const adminCookie = await login("admin@rescuefood.local");
    const verificationResponse = await request(
      `/api/admin/verification/merchant/${saleListing.merchantId}`,
      {
        method: "PATCH",
        cookie: adminCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      },
    );
    assert(verificationResponse.ok, "Admin verification update should succeed");

    console.log("API contract tests passed");
  } finally {
    server.kill("SIGINT");
    run("pnpm", ["db:seed"]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
