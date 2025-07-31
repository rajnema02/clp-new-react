const { shipRocket } = require('../helpers/helper_functions');

module.exports = {
  createCustomOrder: async (data) => {
    const reqData = {
      "order_id": data.order_id,
      "order_date": '2022-11-11 20:40',
      "pickup_location": data.pickup_location,
      "billing_customer_name": data.billing.billing_customer_name,
      "billing_last_name": "",
      "billing_address": data.billing.billing_address,
      "billing_city": data.billing.billing_city,
      "billing_pincode": data.billing.billing_pincode,
      "billing_state": data.billing.billing_state,
      "billing_country": data.billing.billing_country,
      "billing_email": data.billing.billing_email,
      "billing_phone": data.billing.billing_phone,
      "shipping_is_billing": data.shipping_is_billing,
      // "order_items": data.order_items,
      "order_items": data.order_items.map(o => {
        return {
          "name": o.toothId,
          "sku": o.toothId,
          "units": 1,
          "selling_price": o.category.unitPrice,
          "discount": 0,
          "tax": 0,
          "hsn": '',
        }
      }),
      "payment_method": "Prepaid",
      "sub_total": data.order_items.reduce((a, b) => a + b.category.unitPrice, 0),
      "length": 15,
      "breadth": 15,
      "height": 7,
      "weight": .150
    }
    if (!reqData.shipping_is_billing) {
      reqData = {
        ...reqData,
        "shipping_customer_name": data.shipping.shipping_customer_name,
        "shipping_address": data.shipping.shipping_address,
        "shipping_city": data.shipping.shipping_city,
        "shipping_pincode": data.shipping.shipping_pincode,
        "shipping_country": data.shipping.shipping_country,
        "shipping_state": data.shipping.shipping_state,
        "shipping_email": data.shipping.shipping_email,
        "shipping_phone": data.shipping.shipping_phone,
      }
    }
    // console.log(reqData)
    return await shipRocket('orders/create/adhoc', reqData, 'POST');
  },

  cancelOrder: async (data) => {
    const reqData = {
      ids: data.ids
    };
    return await shipRocket('orders/cancel', reqData, 'POST');
  },

  getAllOrder: async () => {
    const reqData = {}
    return await shipRocket('orders', reqData, 'GET');
  },
  track: async (data) => {
    // const reqData = {}
    return await shipRocket('courier/track/shipment', data, 'GET');
  },
  addPickupLocation: async (data) => {
    const reqData = {
      "pickup_location": data.name,
      "name": data.name,
      "email": data.billing_email,
      "phone": data.phone,
      "address": data.address,
      "address_2": data.address_2,
      "city": data.city,
      "state": data.state,
      "country": data.country,
      "pin_code": data.pincode
    }
    return await shipRocket('settings/company/addpickup', reqData, 'POST');
  },
  genrateManifest: async (data) => {
    const reqData = {
      "shipment_id": data.shipment_id
    }
    return await shipRocket('manifests/generate', reqData, 'POST');
  },
  printManifest: async (data) => {
    const reqData = {
      "order_ids": data.order_id
    }
    return await shipRocket('manifests/print', reqData, 'POST');
  },
  genrateLabel: async (data) => {
    const reqData = {
      "shipment_id": data.shipment_id
    }
    return await shipRocket('courier/generate/label', reqData, 'POST');
  },
  pickupReq: async (data) => {
    const reqData = {
      "shipment_id": data.shipment_id
    }
    return await shipRocket('courier/generate/pickup', reqData, 'POST');
  },
  genrateAwb: async (data) => {
    const reqData = {
      "shipment_id": data.shipment_id,
      "courier_id": data.courier_id
    }
    return await shipRocket('courier/assign/awb', reqData, 'POST');
  }
}