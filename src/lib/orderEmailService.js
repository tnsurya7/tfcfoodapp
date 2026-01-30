import emailjs from "@emailjs/browser";

export const sendOrderEmail = async (order) => {
  const serviceId = process.env.NEXT_PUBLIC_ORDER_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_ORDER_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_ORDER_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("❌ Missing EmailJS environment variables");
    throw new Error("EmailJS configuration incomplete");
  }

  const html = `
  <div style="font-family:Arial,sans-serif;background:#0b0b0b;padding:20px;color:#fff;margin:0">
    <div style="max-width:600px;margin:0 auto;background:#111;padding:30px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3)">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#ffd700;margin:0;font-size:28px;font-weight:bold">🍗 TFC Thozha Fried Chicken</h1>
        <p style="color:#ccc;margin:10px 0 0 0;font-size:16px">New Order Received</p>
        <div style="width:60px;height:3px;background:#ff4444;margin:15px auto"></div>
      </div>

      <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin-bottom:20px">
        <h2 style="color:#ff4444;margin:0 0 15px 0;font-size:20px">👤 Customer Details</h2>
        <table style="width:100%;color:#fff">
          <tr><td style="padding:5px 0;font-weight:bold">Name:</td><td style="padding:5px 0">${order.customer}</td></tr>
          <tr><td style="padding:5px 0;font-weight:bold">Phone:</td><td style="padding:5px 0">${order.phone}</td></tr>
          <tr><td style="padding:5px 0;font-weight:bold">Email:</td><td style="padding:5px 0">${order.email}</td></tr>
          <tr><td style="padding:5px 0;font-weight:bold">Order Type:</td><td style="padding:5px 0">${order.orderType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</td></tr>
        </table>
      </div>

      <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin-bottom:20px">
        <h2 style="color:#ff4444;margin:0 0 15px 0;font-size:20px">🛍️ Order Items</h2>
        ${order.items.map(item => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333">
            <span style="color:#fff">${item.name} × ${item.quantity}</span>
            <span style="color:#ffd700;font-weight:bold">₹${(item.price * item.quantity).toFixed(0)}</span>
          </div>
        `).join("")}
        <div style="display:flex;justify-content:space-between;padding:15px 0 5px 0;font-size:18px;font-weight:bold">
          <span style="color:#fff">Total Amount:</span>
          <span style="color:#ff4444;font-size:20px">₹${order.total}</span>
        </div>
      </div>

      <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin-bottom:20px">
        <h2 style="color:#ff4444;margin:0 0 15px 0;font-size:20px">💳 Payment Details</h2>
        <p style="color:#fff;margin:5px 0">Method: <strong>${order.paymentMethod === 'cod' ? (order.orderType === 'pickup' ? 'Pay at Store (Cash)' : 'Cash on Delivery') : 'UPI Online Pay'}</strong></p>
        ${order.upiDetails ? `
          <div style="margin-top:10px;padding:10px;background:#2a2a2a;border-radius:6px">
            <p style="color:#ccc;margin:5px 0">UPI App: <strong style="color:#fff">${order.upiDetails.app}</strong></p>
            <p style="color:#ccc;margin:5px 0">Customer UPI Name: <strong style="color:#fff">${order.upiDetails.name}</strong></p>
            <p style="color:#ccc;margin:5px 0">Customer UPI Mobile: <strong style="color:#fff">${order.upiDetails.mobile}</strong></p>
          </div>
        ` : ''}
      </div>

      <div style="background:#1a1a1a;padding:20px;border-radius:8px;margin-bottom:30px">
        <h2 style="color:#ff4444;margin:0 0 15px 0;font-size:20px">📍 ${order.orderType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}</h2>
        <p style="color:#fff;margin:0;line-height:1.5">${order.address}</p>
      </div>

      <div style="text-align:center;padding:20px;background:#2a2a2a;border-radius:8px">
        <h3 style="color:#ffd700;margin:0 0 10px 0">TFC Thozha Fried Chicken</h3>
        <p style="color:#ccc;margin:5px 0">BKN School Opposite, Nasiyanur, Erode</p>
        <p style="color:#ccc;margin:5px 0">Tamil Nadu, India</p>
        <p style="color:#ccc;margin:5px 0">📞 +91 6379151006 | +91 9566376453</p>
        <p style="color:#ccc;margin:5px 0">📧 tfcfoodorder@gmail.com</p>
        <p style="color:#ccc;margin:15px 0 5px 0;font-size:12px">Business Hours: Monday-Sunday 12:00 PM - 11:00 PM</p>
      </div>
    </div>
  </div>
  `;

  try {
    console.log("📧 Sending order email to tfcfoodorder@gmail.com...");
    
    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: "tfcfoodorder@gmail.com",
        message_html: html
      },
      publicKey
    );

    console.log("✅ Order email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Order email failed:", error);
    throw error;
  }
};