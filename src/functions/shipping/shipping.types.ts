export type ShippingBody = {
  origin: {
    country: string;
    postal_code: string;
    province: any;
    city: string;
    name: any;
    address1: string;
    address2: string;
    address3: any;
    latitude: number;
    longitude: number;
    phone: string;
    fax: any;
    email: any;
    address_type: any;
    company_name: string;
  };
  destination: {
    country: string;
    postal_code: string;
    province: any;
    city: string;
    name: string;
    address1: string;
    address2: any;
    address3: any;
    latitude: number;
    longitude: number;
    phone: any;
    fax: any;
    email: any;
    address_type: any;
    company_name: any;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    grams: number;
    price: number;
    vendor: string;
    requires_shipping: boolean;
    taxable: any;
    fulfillment_service: string;
    properties?: {
      _from: string;
      _to: string;
      _customerId: string;
      Dato: string;
      Tid: string;
      Behandler: string;
      Varighed: string;
      _lookupId?: string;
    };
    product_id: number;
    variant_id: number;
  }>;
  currency: string;
  locale: string;
};
