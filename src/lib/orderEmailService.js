import emailjs from "@emailjs/browser";

export const sendOrderEmail = async (order) => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  emailjs.init(publicKey);

  const html = `
  <div style="background:#0b0b0b;padding:20px;color:#fff;font-family:Arial">
    <div style="max-width:600px;margin:auto;background:#111;padding:20px;border-radius:10px">
      <h2 style="text-align:center;color:#ffd700">🍗 TFC Thozha Fried Chicken</h2>
      <p style="text-align:center;color:#ccc">New Order Received</p>
      
      <hr style="border:1px solid #333"/>
      
      <h3 style="color:#ff4444">Customer Details</h3>
      <p>Name: ${order.customer}</p>
      <p>Phone: ${order.phone}</p>
      <p>Email: ${order.email}</p>
      
      <h3 style="color:#ff4444">Order Type</h3>
      <p>${order.orderType === "pickup" ? "Store Pickup" : "Home Delivery"}</p>
      
      <h3 style="color:#ff4444">Order Items</h3>
      ${order.items.map(i =>
        `<p>${i.name} x ${i.quantity} - ₹${i.price * i.quantity}</p>`
      ).join("")}
      
      <h3 style="color:#ff4444">Payment Details</h3>
      <p>Total: ₹${order.total}</p>
      <p>Payment Method: ${order.paymentMethod.toUpperCase()}</p>
      
      ${order.upiDetails ? `
        <p><strong>UPI Details:</strong></p>
        <p>UPI App: ${order.upiDetails.app}</p>
        <p>Customer UPI Name: ${order.upiDetails.name}</p>
        <p>Customer UPI Mobile: ${order.upiDetails.mobile}</p>
      ` : ""}
      
      <h3 style="color:#ff4444">Delivery Address</h3>
      <p>${order.address}</p>
      
      <hr style="border:1px solid #333"/>
      
      <p style="color:#aaa;text-align:center">
        TFC Thozha Fried Chicken<br/>
        BKN School Opposite, Nasiyanur, Erode<br/>
        Phone: +91 6379151006, +91 9566376453<br/>
        Email: tfcfoodorder@gmail.com
      </p>
    </div>
  </div>
  `;

  const res = await emailjs.send(
    serviceId,
    templateId,
    { message_html: html }
  );

  console.log("EmailJS:", res);
};