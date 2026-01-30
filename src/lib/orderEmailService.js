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
  <div style="font-family:Arial,sans-serif;background:#f8f9fa;padding:20px;color:#333;margin:0">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden">
      
      <!-- Header with TFC Red Background -->
      <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);padding:30px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:32px;font-weight:bold;text-shadow:0 2px 4px rgba(0,0,0,0.3)">🍗 TFC - Thozha Fried Chicken & BBQ</h1>
        <p style="color:#fef3c7;margin:10px 0 0 0;font-size:18px;font-weight:500">New Order Received!</p>
        <div style="width:80px;height:4px;background:#fbbf24;margin:15px auto;border-radius:2px"></div>
      </div>

      <!-- Customer Details -->
      <div style="padding:25px;background:#fff">
        <div style="background:#fef3c7;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #f59e0b">
          <h2 style="color:#dc2626;margin:0 0 15px 0;font-size:20px;display:flex;align-items:center">
            <span style="background:#dc2626;color:#fff;padding:8px;border-radius:50%;margin-right:10px;font-size:16px">👤</span>
            Customer Details
          </h2>
          <table style="width:100%;color:#374151">
            <tr><td style="padding:8px 0;font-weight:600;color:#dc2626">Name:</td><td style="padding:8px 0;font-weight:500">${order.customer}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#dc2626">Phone:</td><td style="padding:8px 0;font-weight:500">${order.phone}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#dc2626">Email:</td><td style="padding:8px 0;font-weight:500">${order.email}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#dc2626">Order Type:</td><td style="padding:8px 0;font-weight:500">${order.orderType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</td></tr>
          </table>
        </div>

        <!-- Order Items -->
        <div style="background:#fff7ed;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #f59e0b">
          <h2 style="color:#dc2626;margin:0 0 15px 0;font-size:20px;display:flex;align-items:center">
            <span style="background:#f59e0b;color:#fff;padding:8px;border-radius:50%;margin-right:10px;font-size:16px">🛍️</span>
            Order Items
          </h2>
          ${order.items.map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:2px solid #fed7aa;background:#fff;margin:8px 0;padding:15px;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,0.05)">
              <span style="color:#374151;font-weight:500">${item.name} × ${item.quantity}</span>
              <span style="color:#dc2626;font-weight:bold;font-size:16px">₹${(item.price * item.quantity).toFixed(0)}</span>
            </div>
          `).join("")}
          <div style="background:#dc2626;color:#fff;padding:15px;border-radius:8px;margin-top:15px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:18px;font-weight:600">Total Amount:</span>
            <span style="font-size:24px;font-weight:bold">₹${order.total}</span>
          </div>
        </div>

        <!-- Payment Details -->
        <div style="background:#fef3c7;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #f59e0b">
          <h2 style="color:#dc2626;margin:0 0 15px 0;font-size:20px;display:flex;align-items:center">
            <span style="background:#f59e0b;color:#fff;padding:8px;border-radius:50%;margin-right:10px;font-size:16px">💳</span>
            Payment Details
          </h2>
          <p style="color:#374151;margin:5px 0;font-size:16px">Method: <strong style="color:#dc2626">${order.paymentMethod === 'cod' ? (order.orderType === 'pickup' ? 'Pay at Store (Cash)' : 'Cash on Delivery') : 'UPI Online Pay'}</strong></p>
          ${order.upiDetails ? `
            <div style="margin-top:15px;padding:15px;background:#fff;border-radius:6px;border:2px solid #fed7aa">
              <p style="color:#374151;margin:5px 0"><strong style="color:#dc2626">UPI App:</strong> ${order.upiDetails.app}</p>
              <p style="color:#374151;margin:5px 0"><strong style="color:#dc2626">Customer UPI Name:</strong> ${order.upiDetails.name}</p>
              <p style="color:#374151;margin:5px 0"><strong style="color:#dc2626">Customer UPI Mobile:</strong> ${order.upiDetails.mobile}</p>
            </div>
          ` : ''}
        </div>

        <!-- Address -->
        <div style="background:#fff7ed;padding:20px;border-radius:8px;margin-bottom:20px;border-left:4px solid #f59e0b">
          <h2 style="color:#dc2626;margin:0 0 15px 0;font-size:20px;display:flex;align-items:center">
            <span style="background:#dc2626;color:#fff;padding:8px;border-radius:50%;margin-right:10px;font-size:16px">📍</span>
            ${order.orderType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
          </h2>
          <p style="color:#374151;margin:0;line-height:1.6;font-size:16px;background:#fff;padding:15px;border-radius:6px;border:2px solid #fed7aa">${order.address}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);padding:25px;text-align:center;color:#fff">
        <h3 style="color:#fbbf24;margin:0 0 15px 0;font-size:22px;font-weight:bold">TFC - Thozha Fried Chicken & BBQ</h3>
        <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:8px;margin:15px 0">
          <p style="color:#fef3c7;margin:5px 0;font-size:16px">📍 BKN School Opposite, Nasiyanur, Erode</p>
          <p style="color:#fef3c7;margin:5px 0;font-size:16px">Tamil Nadu, India</p>
          <p style="color:#fef3c7;margin:10px 0;font-size:16px">📞 +91 6379151006 | +91 8508436152</p>
          <p style="color:#fef3c7;margin:5px 0;font-size:16px">📧 tfcfoodorder@gmail.com</p>
        </div>
        <p style="color:#fed7aa;margin:15px 0 5px 0;font-size:14px;font-weight:500">Business Hours: Monday-Sunday 12:00 PM - 11:00 PM</p>
        <div style="margin-top:20px;padding-top:15px;border-top:2px solid rgba(255,255,255,0.2)">
          <p style="color:#fed7aa;margin:0;font-size:12px">🍗 Delicious food delivered with love & care 🍗</p>
        </div>
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