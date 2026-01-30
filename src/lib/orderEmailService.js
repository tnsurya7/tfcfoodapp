import emailjs from "@emailjs/browser";

// Initialize EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

export const sendOrderEmail = async (order) => {
    // Ensure we have the correct template ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID;
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    
    console.log('🔧 EmailJS Config Check:');
    console.log('Service ID:', serviceId);
    console.log('Template ID:', templateId);
    console.log('Public Key:', publicKey ? 'Present' : 'Missing');
    
    if (!templateId || !serviceId || !publicKey) {
        console.error('❌ Missing EmailJS environment variables');
        throw new Error('EmailJS configuration incomplete');
    }

    const html = `
    <div style="font-family:Arial;background:#0b0b0b;padding:20px;color:#fff">
        <div style="max-width:600px;margin:auto;background:#111;border-radius:10px;padding:20px">
            <h2 style="text-align:center;color:#ffd700">
                🍗 TFC Thozha Fried Chicken & BBQ
            </h2>
            <p style="text-align:center;color:#ccc">
                New Order Received
            </p>
            <hr style="border:1px solid #333" />
            <h3 style="color:#ff4444">Customer Details</h3>
            <p>Name: ${order.customer}</p>
            <p>Phone: ${order.phone}</p>
            <p>Email: ${order.email}</p>
            <p>Order Type: ${order.orderType === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
            <hr style="border:1px solid #333" />
            <h3 style="color:#ff4444">Order Items</h3>
            ${order.items.map(i => `
                <p>
                    ${i.name} x ${i.quantity} — ₹${i.price * i.quantity}
                </p>
            `).join("")}
            <hr style="border:1px solid #333" />
            <h3>Total: ₹${order.total}</h3>
            <p>Payment Method: ${order.paymentMethod.toUpperCase()}</p>
            ${order.upiDetails ? `
                <p>UPI App: ${order.upiDetails.app}</p>
                <p>Customer UPI Name: ${order.upiDetails.name}</p>
                <p>Customer UPI Mobile: ${order.upiDetails.mobile}</p>
            ` : ""}
            <hr style="border:1px solid #333" />
            <h3 style="color:#ff4444">Delivery Address</h3>
            <p>${order.address}</p>
            <p style="margin-top:20px;color:#aaa">
                TFC Thozha Fried Chicken<br/>
                BKN School Opposite, Nasiyanur, Erode<br/>
                Phone: +91 6379151006, +91 8508436152<br/>
                Email: tfcfoodorder@gmail.com
            </p>
        </div>
    </div>
    `;

    try {
        const response = await emailjs.send(
            serviceId,
            templateId,
            {
                message_html: html
            }
        );
        
        console.log('✅ Order email sent successfully with template:', templateId);
        console.log('📧 EmailJS Response:', response);
        return response;
    } catch (error) {
        console.error('❌ EmailJS Error Details:', error);
        console.error('❌ Error Status:', error.status);
        console.error('❌ Error Text:', error.text);
        throw error;
    }
};