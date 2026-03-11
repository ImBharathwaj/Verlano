const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY;

export type ShiprocketShipmentResult = {
  trackingId: string;
  trackingUrl?: string;
  shippingProvider?: string;
  shippingStatus?: string;
};

export async function createShipmentForOrder(orderId: string): Promise<ShiprocketShipmentResult | null> {
  if (!SHIPROCKET_API_KEY) {
    return null;
  }

  // This is a lightweight placeholder. In a real integration, you would:
  // - Authenticate with Shiprocket
  // - Send order + address + line items
  // - Receive tracking id / URL
  //
  // Here we just fabricate a tracking id so that the rest of the flow works.

  const trackingId = `SR-${orderId.slice(0, 8)}-${Date.now().toString(36)}`;

  return {
    trackingId,
    trackingUrl: undefined,
    shippingProvider: "shiprocket",
    shippingStatus: "created",
  };
}

