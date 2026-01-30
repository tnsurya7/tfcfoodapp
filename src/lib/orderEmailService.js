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
  <div style="font-family:Arial,sans-serif;background:#f2f2f2;padding:20px;margin:0">
    <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.2)">
      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#c62828,#f9a825);padding:28px;text-align:center;color:#ffffff">
        <h1 style="margin:0;font-size:26px;font-weight:bold">🍗 TFC - Thozha Fried Chicken & BBQ</h1>
        <p style="margin-top:8px;font-size:15px">New Order Received!</p>
        <div style="width:70px;height:4px;background:#ffffff;margin:14px auto;border-radius:5px"></div>
      </div>
      
      <!-- CONTENT -->
      <div style="padding:22px">
        <!-- CUSTOMER -->
        <div style="background:#fff7d6;padding:18px;border-radius:10px;margin-bottom:18px">
          <h3 style="margin:0 0 12px;color:#c62828">👤 Customer Details</h3>
          <p><b>Name:</b> ${order.customer}</p>
          <p><b>Phone:</b> ${order.phone}</p>
          <p><b>Email:</b> ${order.email}</p>
          <p><b>Order Type:</b> ${order.orderType === "pickup" ? "Store Pickup" : "Home Delivery"}</p>
        </div>
        
        <!-- ITEMS -->
        <div style="background:#fff3e0;padding:18px;border-radius:10px;margin-bottom:18px">
          <h3 style="margin:0 0 12px;color:#c62828">🛍️ Order Items</h3>
          ${order.items.map(i => `
            <div style="display:flex;justify-content:space-between;border-bottom:1px dashed #ccc;padding:8px 0">
              <span>${i.name} × ${i.quantity}</span>
              <b>₹${(i.price * i.quantity)}</b>
            </div>
          `).join("")}
          <div style="margin-top:12px;background:#c62828;color:#fff;padding:12px;border-radius:8px;display:flex;justify-content:space-between;font-size:18px">
            <b>Total Amount</b>
            <b>₹${order.total}</b>
          </div>
        </div>
        
        <!-- PAYMENT -->
        <div style="background:#fff7d6;padding:18px;border-radius:10px;margin-bottom:18px">
          <h3 style="margin:0 0 12px;color:#c62828">💳 Payment Details</h3>
          <p>Method: <b>${order.paymentMethod === "cod" ? (order.orderType === "pickup" ? "Pay at Store (Cash)" : "Cash on Delivery") : "UPI Online Pay"}</b></p>
          ${order.upiDetails ? `
            <div style="margin-top:10px;padding:10px;background:#fff;border-radius:6px;border:2px solid #f9a825">
              <p><b>UPI App:</b> ${order.upiDetails.app}</p>
              <p><b>Customer UPI Name:</b> ${order.upiDetails.name}</p>
              <p><b>Customer UPI Mobile:</b> ${order.upiDetails.mobile}</p>
            </div>
          ` : ''}
        </div>
        
        <!-- ADDRESS -->
        <div style="background:#fff3e0;padding:18px;border-radius:10px">
          <h3 style="margin:0 0 12px;color:#c62828">📍 ${order.orderType === "pickup" ? "Pickup Location" : "Delivery Address"}</h3>
          <p>${order.address}</p>
        </div>
      </div>
      
      <!-- FOOTER -->
      <div style="background:linear-gradient(135deg,#c62828,#f9a825);padding:22px;text-align:center;color:#ffffff">
        <h3 style="margin:0">TFC - Thozha Fried Chicken & BBQ</h3>
        <p>BKN School Opposite, Nasiyanur, Erode</p>
        <p>� +91 6379151006 | +91 8508436152</p>
        <p>📧 tfcfoodorder@gmail.com</p>
        <p style="font-size:12px;margin-top:10px">Business Hours: 12:00 PM - 11:00 PM</p>
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