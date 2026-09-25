const express = require('express');
const router = express.Router();
const Commission = require('../models/Commission');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const { protect, isAdmin, isVendor } = require('../middleware/auth');

// Vendor Payout Statement (JSP-style server-rendered HTML report)
router.get('/vendor-payout/:vendorId', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId).populate('user', 'name email');
    const commissions = await Commission.find({ vendor: req.params.vendorId })
      .populate('order', 'createdAt totalAmount orderStatus')
      .sort({ createdAt: -1 });

    const totalEarned = commissions.reduce((a, c) => a + c.vendorPayout, 0);
    const totalCommission = commissions.reduce((a, c) => a + c.commissionAmount, 0);
    const totalOrders = commissions.length;

    const rows = commissions.map(c => `
      <tr>
        <td>${c.order?.createdAt ? new Date(c.order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
        <td>${c.order?._id?.toString().slice(-8).toUpperCase() || 'N/A'}</td>
        <td>₹${c.orderAmount.toFixed(2)}</td>
        <td>${(c.commissionRate * 100).toFixed(0)}%</td>
        <td style="color:#e74c3c;">-₹${c.commissionAmount.toFixed(2)}</td>
        <td style="color:#27ae60;font-weight:bold;">₹${c.vendorPayout.toFixed(2)}</td>
        <td><span class="badge ${c.status}">${c.status.toUpperCase()}</span></td>
      </tr>
    `).join('');

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vendor Payout Statement - ${vendor?.shopName || 'Vendor'}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f0f4f8; color:#2d3748; }
  .report-wrapper { max-width:900px; margin:40px auto; background:#fff; box-shadow:0 20px 60px rgba(0,0,0,0.1); border-radius:16px; overflow:hidden; }
  .report-header { background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); color:#fff; padding:50px 50px 40px; position:relative; overflow:hidden; }
  .report-header::before { content:''; position:absolute; right:-50px; top:-50px; width:300px; height:300px; background:rgba(255,215,0,0.05); border-radius:50%; }
  .report-header::after { content:''; position:absolute; right:50px; bottom:-80px; width:200px; height:200px; background:rgba(255,215,0,0.03); border-radius:50%; }
  .brand { font-family:'Playfair Display',serif; font-size:28px; color:#ffd700; letter-spacing:2px; margin-bottom:8px; }
  .report-title { font-size:14px; letter-spacing:4px; text-transform:uppercase; opacity:0.7; margin-bottom:30px; }
  .vendor-info { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .info-group label { font-size:11px; text-transform:uppercase; letter-spacing:2px; opacity:0.6; display:block; margin-bottom:4px; }
  .info-group span { font-size:16px; font-weight:600; }
  .report-body { padding:50px; }
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:40px; }
  .summary-card { padding:24px; border-radius:12px; text-align:center; }
  .summary-card.green { background:linear-gradient(135deg,#d4edda,#c3e6cb); border-left:4px solid #27ae60; }
  .summary-card.red { background:linear-gradient(135deg,#f8d7da,#f5c6cb); border-left:4px solid #e74c3c; }
  .summary-card.blue { background:linear-gradient(135deg,#cce5ff,#b8daff); border-left:4px solid #3498db; }
  .summary-card .amount { font-size:28px; font-weight:700; margin-bottom:6px; }
  .summary-card .label { font-size:12px; text-transform:uppercase; letter-spacing:1px; opacity:0.7; }
  table { width:100%; border-collapse:collapse; }
  thead { background:#f7fafc; }
  th { padding:14px 16px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#718096; border-bottom:2px solid #e2e8f0; }
  td { padding:14px 16px; border-bottom:1px solid #f0f4f8; font-size:14px; }
  tr:hover td { background:#f7fafc; }
  .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:1px; }
  .badge.pending { background:#fff3cd; color:#856404; }
  .badge.paid { background:#d4edda; color:#155724; }
  .badge.hold { background:#f8d7da; color:#721c24; }
  .report-footer { background:#f7fafc; padding:30px 50px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; }
  .print-btn { background:linear-gradient(135deg,#1a1a2e,#0f3460); color:#fff; border:none; padding:12px 30px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; letter-spacing:1px; }
  .print-btn:hover { opacity:0.9; }
  @media print { .print-btn { display:none; } }
</style>
</head>
<body>
<div class="report-wrapper">
  <div class="report-header">
    <div class="brand">NEXMART</div>
    <div class="report-title">Vendor Payout Statement</div>
    <div class="vendor-info">
      <div class="info-group"><label>Vendor Name</label><span>${vendor?.shopName || 'N/A'}</span></div>
      <div class="info-group"><label>Vendor ID</label><span>${vendor?._id?.toString().slice(-8).toUpperCase()}</span></div>
      <div class="info-group"><label>Email</label><span>${vendor?.user?.email || 'N/A'}</span></div>
      <div class="info-group"><label>Generated On</label><span>${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span></div>
    </div>
  </div>
  <div class="report-body">
    <div class="summary-grid">
      <div class="summary-card green">
        <div class="amount" style="color:#27ae60;">₹${totalEarned.toFixed(2)}</div>
        <div class="label">Total Payout</div>
      </div>
      <div class="summary-card red">
        <div class="amount" style="color:#e74c3c;">₹${totalCommission.toFixed(2)}</div>
        <div class="label">Commission Deducted</div>
      </div>
      <div class="summary-card blue">
        <div class="amount" style="color:#3498db;">${totalOrders}</div>
        <div class="label">Total Orders</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Date</th><th>Order ID</th><th>Order Amt</th><th>Commission %</th><th>Deduction</th><th>Net Payout</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;color:#718096;">No transactions yet</td></tr>'}
      </tbody>
    </table>
  </div>
  <div class="report-footer">
    <div style="font-size:12px;color:#718096;">This is a system-generated statement. Commission rate: 10%</div>
    <button class="print-btn" onclick="window.print()">🖨️ Print Statement</button>
  </div>
</div>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('<h2>Error generating report</h2>');
  }
});

// Admin Commission Summary Report (JSP-style)
router.get('/admin-commission', protect, isAdmin, async (req, res) => {
  try {
    const vendorSummary = await Commission.aggregate([
      {
        $group: {
          _id: '$vendor',
          totalOrderAmount: { $sum: '$orderAmount' },
          totalCommission: { $sum: '$commissionAmount' },
          totalPayout: { $sum: '$vendorPayout' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalCommission: -1 } }
    ]);

    // Populate vendor details
    const Vendor = require('../models/Vendor');
    const vendorDetails = await Promise.all(
      vendorSummary.map(async (v) => {
        const vendor = await Vendor.findById(v._id).populate('user', 'name email');
        return { ...v, vendorInfo: vendor };
      })
    );

    const grandTotal = vendorDetails.reduce((a, v) => ({
      totalOrderAmount: a.totalOrderAmount + v.totalOrderAmount,
      totalCommission: a.totalCommission + v.totalCommission,
      totalPayout: a.totalPayout + v.totalPayout,
      orderCount: a.orderCount + v.orderCount
    }), { totalOrderAmount: 0, totalCommission: 0, totalPayout: 0, orderCount: 0 });

    const rows = vendorDetails.map((v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <strong>${v.vendorInfo?.shopName || 'Unknown'}</strong><br>
          <small style="color:#718096;">${v.vendorInfo?.user?.email || ''}</small>
        </td>
        <td>${v.orderCount}</td>
        <td>₹${v.totalOrderAmount.toFixed(2)}</td>
        <td style="color:#e74c3c;font-weight:600;">₹${v.totalCommission.toFixed(2)}</td>
        <td style="color:#27ae60;font-weight:600;">₹${v.totalPayout.toFixed(2)}</td>
        <td>${((v.totalCommission / v.totalOrderAmount) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Commission Summary Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f0f4f8; color:#2d3748; }
  .report-wrapper { max-width:1000px; margin:40px auto; background:#fff; box-shadow:0 20px 60px rgba(0,0,0,0.1); border-radius:16px; overflow:hidden; }
  .report-header { background:linear-gradient(135deg,#2d1b69 0%,#11998e 100%); color:#fff; padding:50px; }
  .brand { font-family:'Playfair Display',serif; font-size:28px; color:#fff; letter-spacing:2px; margin-bottom:8px; }
  .report-title { font-size:14px; letter-spacing:4px; text-transform:uppercase; opacity:0.8; margin-bottom:30px; }
  .header-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .hstat { background:rgba(255,255,255,0.15); border-radius:12px; padding:20px; text-align:center; backdrop-filter:blur(10px); }
  .hstat .num { font-size:24px; font-weight:700; margin-bottom:4px; }
  .hstat .lbl { font-size:11px; text-transform:uppercase; letter-spacing:1px; opacity:0.8; }
  .report-body { padding:50px; }
  table { width:100%; border-collapse:collapse; margin-top:20px; }
  thead { background:linear-gradient(135deg,#2d1b69,#11998e); color:#fff; }
  th { padding:16px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:1px; }
  td { padding:16px; border-bottom:1px solid #f0f4f8; font-size:14px; }
  tr:hover td { background:#f7fafc; }
  tfoot td { background:#f7fafc; font-weight:700; font-size:15px; border-top:2px solid #e2e8f0; }
  .report-footer { background:#f7fafc; padding:30px 50px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; }
  .print-btn { background:linear-gradient(135deg,#2d1b69,#11998e); color:#fff; border:none; padding:12px 30px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; }
  @media print { .print-btn { display:none; } }
</style>
</head>
<body>
<div class="report-wrapper">
  <div class="report-header">
    <div class="brand">NEXMART ADMIN</div>
    <div class="report-title">Commission Summary Report</div>
    <div class="header-stats">
      <div class="hstat"><div class="num">${grandTotal.orderCount}</div><div class="lbl">Total Orders</div></div>
      <div class="hstat"><div class="num">₹${grandTotal.totalOrderAmount.toFixed(0)}</div><div class="lbl">Gross Revenue</div></div>
      <div class="hstat"><div class="num">₹${grandTotal.totalCommission.toFixed(0)}</div><div class="lbl">Commission Earned</div></div>
      <div class="hstat"><div class="num">₹${grandTotal.totalPayout.toFixed(0)}</div><div class="lbl">Vendor Payouts</div></div>
    </div>
  </div>
  <div class="report-body">
    <h3 style="margin-bottom:20px;font-family:'Playfair Display',serif;color:#2d3748;">Vendor-wise Breakdown</h3>
    <table>
      <thead>
        <tr><th>#</th><th>Vendor</th><th>Orders</th><th>Gross Amt</th><th>Commission</th><th>Net Payout</th><th>Rate</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;">No data available</td></tr>'}</tbody>
      <tfoot>
        <tr>
          <td colspan="2">GRAND TOTAL</td>
          <td>${grandTotal.orderCount}</td>
          <td>₹${grandTotal.totalOrderAmount.toFixed(2)}</td>
          <td style="color:#e74c3c;">₹${grandTotal.totalCommission.toFixed(2)}</td>
          <td style="color:#27ae60;">₹${grandTotal.totalPayout.toFixed(2)}</td>
          <td>10%</td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="report-footer">
    <div style="font-size:12px;color:#718096;">Generated: ${new Date().toLocaleString('en-IN')} | NEXMART Platform</div>
    <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
  </div>
</div>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('<h2>Error generating report</h2>');
  }
});

module.exports = router;
