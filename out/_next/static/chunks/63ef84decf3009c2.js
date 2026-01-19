(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,18670,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(80064);let r=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("div",{ref:r,className:(0,s.cn)("rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",e),...a}));r.displayName="Card";let l=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("div",{ref:r,className:(0,s.cn)("flex flex-col space-y-1.5 p-6",e),...a}));l.displayName="CardHeader";let i=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("h3",{ref:r,className:(0,s.cn)("text-2xl font-semibold leading-none tracking-tight",e),...a}));i.displayName="CardTitle";let n=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("p",{ref:r,className:(0,s.cn)("text-sm text-zinc-500 dark:text-zinc-400",e),...a}));n.displayName="CardDescription";let d=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("div",{ref:r,className:(0,s.cn)("p-6 pt-0",e),...a}));d.displayName="CardContent",a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("div",{ref:r,className:(0,s.cn)("flex items-center p-6 pt-0",e),...a})).displayName="CardFooter",e.s(["Card",()=>r,"CardContent",()=>d,"CardDescription",()=>n,"CardHeader",()=>l,"CardTitle",()=>i])},53269,65930,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(80064);let r=a.forwardRef(({className:e,type:a,...r},l)=>(0,t.jsx)("input",{type:a,className:(0,s.cn)("flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:file:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",e),ref:l,...r}));r.displayName="Input",e.s(["Input",()=>r],53269);let l=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("label",{ref:r,className:(0,s.cn)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",e),...a}));l.displayName="Label",e.s(["Label",()=>l],65930)},99411,95695,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(80064);let r=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("div",{className:"relative w-full overflow-auto",children:(0,t.jsx)("table",{ref:r,className:(0,s.cn)("w-full caption-bottom text-sm",e),...a})}));r.displayName="Table";let l=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("thead",{ref:r,className:(0,s.cn)("[&_tr]:border-b",e),...a}));l.displayName="TableHeader";let i=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("tbody",{ref:r,className:(0,s.cn)("[&_tr:last-child]:border-0",e),...a}));i.displayName="TableBody",a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("tfoot",{ref:r,className:(0,s.cn)("border-t bg-zinc-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-zinc-800/50",e),...a})).displayName="TableFooter";let n=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("tr",{ref:r,className:(0,s.cn)("border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800",e),...a}));n.displayName="TableRow";let d=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("th",{ref:r,className:(0,s.cn)("h-12 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0 dark:text-zinc-400",e),...a}));d.displayName="TableHead";let c=a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("td",{ref:r,className:(0,s.cn)("p-4 align-middle [&:has([role=checkbox])]:pr-0",e),...a}));c.displayName="TableCell",a.forwardRef(({className:e,...a},r)=>(0,t.jsx)("caption",{ref:r,className:(0,s.cn)("mt-4 text-sm text-zinc-500 dark:text-zinc-400",e),...a})).displayName="TableCaption",e.s(["Table",()=>r,"TableBody",()=>i,"TableCell",()=>c,"TableHead",()=>d,"TableHeader",()=>l,"TableRow",()=>n],99411),e.i(47167);let o=e.i(81949).default.create({baseURL:"http://localhost:5000/api",headers:{"Content-Type":"application/json"}});o.interceptors.request.use(e=>{let t=localStorage.getItem("token");return t&&(e.headers.Authorization=`Bearer ${t}`),e},e=>Promise.reject(e)),o.interceptors.response.use(e=>e,e=>(e.response?.status===401&&(localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.href="/login"),Promise.reject(e))),e.s(["areaAPI",0,{getAll:()=>o.get("/areas"),create:e=>o.post("/areas",e),update:(e,t)=>o.put(`/areas/${e}`,t),delete:e=>o.delete(`/areas/${e}`)},"categoryAPI",0,{getAll:()=>o.get("/categories"),getById:e=>o.get(`/categories/${e}`),create:e=>o.post("/categories",e),update:(e,t)=>o.put(`/categories/${e}`,t),delete:e=>o.delete(`/categories/${e}`)},"customerAPI",0,{getAll:e=>o.get("/customers",{params:e}),getById:e=>o.get(`/customers/${e}`),create:e=>o.post("/customers",e),update:(e,t)=>o.put(`/customers/${e}`,t),delete:e=>o.delete(`/customers/${e}`),getLedger:e=>o.get(`/customers/${e}/ledger`)},"expenseAPI",0,{getAll:e=>o.get("/expenses",{params:e}),getById:e=>o.get(`/expenses/${e}`),create:e=>o.post("/expenses",e),delete:e=>o.delete(`/expenses/${e}`)},"paymentAPI",0,{createCustomerPayment:e=>o.post("/payment/customer",e)},"productAPI",0,{getAll:e=>o.get("/products",{params:e}),getById:e=>o.get(`/products/${e}`),create:e=>o.post("/products",e),update:(e,t)=>o.put(`/products/${e}`,t),delete:e=>o.delete(`/products/${e}`)},"purchaseAPI",0,{getAll:e=>o.get("/purchases",{params:e}),getById:e=>o.get(`/purchases/${e}`),create:e=>o.post("/purchases",e)},"reportAPI",0,{getProfit:e=>o.get("/reports/profit",{params:e}),getCategory:e=>o.get("/reports/category",{params:e}),getStock:e=>o.get("/reports/stock",{params:e}),getOutstandingCustomers:()=>o.get("/reports/outstanding-customers"),getOutstandingSuppliers:()=>o.get("/reports/outstanding-suppliers"),getAreaSales:e=>o.get("/reports/area-sales",{params:e}),getProductInsights:e=>o.get("/reports/product-insights",{params:e}),getShopProfit:e=>o.get("/reports/shop-profit",{params:e}),getProductsByArea:e=>o.get("/reports/products-by-area",{params:e}),getLoadPass:e=>o.get("/reports/loadpass",{params:e}),getRecoverySheet:e=>o.get("/reports/recovery-sheet",{params:e})},"returnAPI",0,{getAll:e=>o.get("/returns",{params:e}),getById:e=>o.get(`/returns/${e}`),getBySale:e=>o.get(`/returns/sale/${e}`),create:e=>o.post("/returns",e)},"saleAPI",0,{getAll:e=>o.get("/sales",{params:e}),getById:e=>o.get(`/sales/${e}`),create:e=>o.post("/sales",e),reprint:e=>o.post(`/sales/${e}/reprint`),getBill:e=>o.get(`/sales/${e}/bill`)},"staffAPI",0,{getAll:e=>o.get("/staff",{params:e}),getById:e=>o.get(`/staff/${e}`),create:e=>o.post("/staff",e),update:(e,t)=>o.put(`/staff/${e}`,t),delete:e=>o.delete(`/staff/${e}`),recordAdvance:(e,t)=>o.post(`/staff/${e}/advance`,t),paySalary:(e,t)=>o.post(`/staff/${e}/salary`,t),getAdvances:e=>o.get(`/staff/${e}/advances`)},"supplierAPI",0,{getAll:e=>o.get("/suppliers",{params:e}),getById:e=>o.get(`/suppliers/${e}`),create:e=>o.post("/suppliers",e),update:(e,t)=>o.put(`/suppliers/${e}`,t),delete:e=>o.delete(`/suppliers/${e}`),getLedger:e=>o.get(`/suppliers/${e}/ledger`)}],95695)},87167,e=>{"use strict";var t=e.i(43476),a=e.i(932);e.i(71645);var s=e.i(80064);let r={default:"border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/80",secondary:"border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",destructive:"border-transparent bg-red-500 text-zinc-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-900/80",outline:"text-zinc-950 dark:text-zinc-50",success:"border-transparent bg-green-500 text-white hover:bg-green-500/80",warning:"border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80"};function l(e){let l,i,n,d,c,o=(0,a.c)(10);o[0]!==e?({className:l,variant:n,...i}=e,o[0]=e,o[1]=l,o[2]=i,o[3]=n):(l=o[1],i=o[2],n=o[3]);let p=r[void 0===n?"default":n]||r.default;return o[4]!==l||o[5]!==p?(d=(0,s.cn)("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300",p,l),o[4]=l,o[5]=p,o[6]=d):d=o[6],o[7]!==i||o[8]!==d?(c=(0,t.jsx)("div",{className:d,...i}),o[7]=i,o[8]=d,o[9]=c):c=o[9],c}e.s(["Badge",()=>l])},7095,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(80064);let r=a.forwardRef(({className:e,children:a,...r},l)=>(0,t.jsx)("select",{className:(0,s.cn)("flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300",e),ref:l,...r,children:a}));r.displayName="Select",e.s(["Select",()=>r])},7233,27612,e=>{"use strict";var t=e.i(75254);let a=(0,t.default)("plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);e.s(["Plus",()=>a],7233);let s=(0,t.default)("trash-2",[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]]);e.s(["Trash2",()=>s],27612)},55436,e=>{"use strict";let t=(0,e.i(75254).default)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]]);e.s(["Search",()=>t],55436)},3281,e=>{"use strict";let t=(0,e.i(75254).default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);e.s(["Printer",()=>t],3281)},64310,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(56902),r=e.i(18670),l=e.i(53269),i=e.i(65930),n=e.i(7095),d=e.i(87167);e.i(99411);var c=e.i(95695),o=e.i(80064),p=e.i(55436),m=e.i(7233);let u=(0,e.i(75254).default)("minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);var x=e.i(27612),h=e.i(1928),g=e.i(3281);function v(){let e,v,[f,b]=(0,a.useState)([]),[y,j]=(0,a.useState)([]),[N,w]=(0,a.useState)([]),[C,z]=(0,a.useState)([]),[k,I]=(0,a.useState)(""),[P,S]=(0,a.useState)(""),[$,T]=(0,a.useState)([]),[B,A]=(0,a.useState)(""),[F,R]=(0,a.useState)(0),[L,D]=(0,a.useState)("percentage"),[_,O]=(0,a.useState)("cash"),[Q,U]=(0,a.useState)(""),[M,q]=(0,a.useState)(!0),[H,E]=(0,a.useState)(!1),[G,V]=(0,a.useState)(""),[K,W]=(0,a.useState)(""),[Y,X]=(0,a.useState)(""),[Z,J]=(0,a.useState)(""),[ee,et]=(0,a.useState)(""),[ea,es]=(0,a.useState)(""),[er,el]=(0,a.useState)(""),[ei,en]=(0,a.useState)(""),[ed,ec]=(0,a.useState)(""),[eo,ep]=(0,a.useState)(""),[em,eu]=(0,a.useState)(new Date().toISOString().split("T")[0]);(0,a.useEffect)(()=>{ex()},[]);let ex=async()=>{try{q(!0);let[e,t,a,s]=await Promise.all([c.productAPI.getAll({page:1,limit:1e3}),c.customerAPI.getAll({page:1,limit:1e3}),c.areaAPI.getAll(),c.staffAPI.getAll()]);b(e.data.data.products||[]),j(t.data.data.customers||[]),w(a.data||[]),z(s.data||[])}catch(e){console.error("Error fetching data:",e)}finally{q(!1)}},eh=(e,t)=>{t<=0?eg(e):T($.map(a=>{if(a.product._id===e){let e=t*(a.product.pcsPerUnit||1);return{...a,qtyInUnits:t,totalPcs:e,paidQty:e,freeQty:0}}return a}))},eg=e=>{T($.filter(t=>t.product._id!==e))},ev=(e,t,a)=>{T($.map(s=>{if(s.product._id===e){let e=parseInt(t)||0,r=parseInt(a)||0,l=e+r,i=s.product.pcsPerUnit||1;return{...s,paidQty:e,freeQty:r,totalPcs:l,qtyInUnits:Math.ceil(l/i)}}return s}))},ef=()=>{let e=$.reduce((e,t)=>e+t.price*(t.paidQty||t.totalPcs),0),t=0;t="percentage"===L?e*F/100:F;let a=e-t;return{grossTotal:e,discountAmount:t,netTotal:a,balance:a-(parseFloat(Q)||0)}},eb=async()=>{if(0===$.length)return void alert("Cart is empty");let e=ef();try{E(!0);let t={customerId:B||null,items:$.map(e=>({productId:e.product._id,qty:e.totalPcs,qtyInUnits:e.qtyInUnits,unit:e.product.unit,pcsPerUnit:e.product.pcsPerUnit||1,unitPrice:e.price,paidQty:e.paidQty||e.totalPcs,freeQty:e.freeQty||0})),discountAmount:e.discountAmount,paymentMethod:_,amountPaid:parseFloat(Q)||0,isCredit:"credit"===_,customerNo:G,area:er,deliveredBy:K,deliveredByNo:Y||null,bookedBy:Z,orderByNo:ed||null,licenseNo:ee,cnic:ea,orderNo:ei,dueDate:eo||null,invoiceDate:em||new Date().toISOString().split("T")[0]},a=await c.saleAPI.create(t);a.data.printData&&(console.log("Printing bill",a.data.printData,"length",a.data.printData.items.length),ey(a.data.printData)),T([]),A(""),R(0),U(""),V(""),W(""),X(""),J(""),et(""),es(""),el(""),en(""),ec(""),ep(""),alert("Sale completed successfully!")}catch(e){console.error("Error creating sale:",e),alert(e.response?.data?.message||"Failed to create sale")}finally{E(!1)}},ey=e=>{let t=window.open("","_blank");t.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Invoice - ${e.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 10mm; }

    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      margin: 0;
      padding: 15px;
    }

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .header h1 {
      font-size: 18px;
      margin: 0;
    }

    .header p {
      font-size: 10px;
      margin: 2px 0;
    }

    .invoice-title {
      text-align: center;
      border: 2px solid #000;
      padding: 5px;
      margin: 10px 0;
      font-size: 14px;
      font-weight: bold;
    }

    .meta-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .meta-left, .meta-right {
      width: 48%;
    }

    .meta-row {
      display: flex;
      margin-bottom: 3px;
      font-size: 10px;
    }

    .meta-label {
      width: 120px;
      font-weight: bold;
    }

    .meta-value {
      flex: 1;
      border-bottom: 1px solid #000;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10px;
    }

    th, td {
      border: 1px solid #000;
      padding: 5px 4px;
    }

    th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }

    .summary {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }

    .summary-left, .summary-right {
      width: 48%;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
    }

     .terms {
      border: 1px solid #000;
      padding: 8px;
      font-size: 10px;
      line-height: 1.7;
      margin-top: 10px;
    }

    .terms h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
    }

    .terms p {
      margin: 4px 0;
      text-align: right;
    }
    .grand-total {
      font-size: 16px;
      font-weight: bold;
      border: 2px solid #000;
      padding: 8px;
      margin: 10px 0;
    }

    .terms {
      padding: 8px;
      font-size: 10px;
      line-height: 1.7;
      margin-top: 10px;
    }

    .terms h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
    }

    .terms p {
      margin: 4px 0;
      text-align: right;
    }

    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 10px;
    }
  </style>
</head>

<body>

  <div class="header">
    <h1>Khalil Traders Nowshera</h1>
    <p>Near Ordinance Depot Mohallah Eisakhail Badrashi Nowshera</p>
    <p>Phone: 0335-5314415</p>
  </div>

  <div class="invoice-title">SALES INVOICE</div>

  <div class="meta-section">
    <div class="meta-left">
      <div class="meta-row"><span class="meta-label">Customer #:</span><span class="meta-value">${G||""}</span></div>
      <div class="meta-row"><span class="meta-label">Customer Name:</span><span class="meta-value">${e.customer?.name||"Walk-in Customer"}</span></div>
      <div class="meta-row"><span class="meta-label">Address:</span><span class="meta-value">${e.customer?.address||""}</span></div>
      <div class="meta-row"><span class="meta-label">Phone:</span><span class="meta-value">${e.customer?.phone||""}</span></div>
      <div class="meta-row"><span class="meta-label">Area:</span><span class="meta-value">${er||""}</span></div>
      <div class="meta-row"><span class="meta-label">Salesman:</span><span class="meta-value">${K||""}</span></div>
      <div class="meta-row"><span class="meta-label">Salesman No:</span><span class="meta-value">${Y||"0312-0914180"}</span></div>
      <div class="meta-row"><span class="meta-label">Order Booker:</span><span class="meta-value">${Z||""}</span></div>
      <div class="meta-row"><span class="meta-label">Order Booker Number #</span><span class="meta-value">${ed||""}</span></div>
    </div>

    <div class="meta-right">
      <div class="meta-row"><span class="meta-label">Invoice No:</span><span class="meta-value">${e.invoiceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Invoice Date:</span><span class="meta-value">${new Date(e.date).toLocaleDateString()}</span></div>
      <div class="meta-row"><span class="meta-label">Due Date:</span><span class="meta-value">${eo?new Date(eo).toLocaleDateString():""}</span></div>
      <div class="meta-row"><span class="meta-label">Order No:</span><span class="meta-value">${ei||""}</span></div>
    </div>
  </div>

${Object.entries(e.categorizedItems||{}).map(([e,t])=>`
            <div style="margin: 15px 0;">
              <h3 style="font-size: 12px; margin: 5px 0; padding: 3px; background-color: #f0f0f0; border-left: 3px solid #000;">${e}</h3>
              <table>
                <thead>
                  <tr>
                    <th style="width: 28%;">Item</th>
                    <th style="width: 12%;">Trade Price</th>
                    <th style="width: 12%;">Price</th>
                    <th style="width: 10%;">QTY</th>
                    <th style="width: 10%;">CTN</th>
                    <th style="width: 10%;">PCS</th>
                    <th style="width: 18%;">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.map(e=>`
                    <tr>
                      <td>${e.name}${e.scheme?` <strong style="color: green;">(${e.scheme})</strong>`:""}</td>
                      <td class="text-right">Rs ${(e.costPrice||0).toFixed(2)}</td>
                      <td class="text-right">Rs ${e.unitPrice.toFixed(2)}</td>
                      <td class="text-center">${e.scheme?`${e.paidQty}+${e.freeQty}`:e.qty}</td>
                      <td class="text-center">${("CTN"===e.unit||"BOX"===e.unit)&&e.qtyInUnits||0}</td>
                      <td class="text-center">${e.scheme?`${e.paidQty}+${e.freeQty}`:e.qty}</td>
                      <td class="text-right"><strong>Rs ${e.lineTotal.toFixed(2)}</strong></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `).join("")}

  <div class="summary">
    <div class="summary-left">
      <div><strong>No. of Items:</strong> ${e.items?.length||0}</div>
      <div style="font-size: 10px; margin-bottom: 5px;">
        <strong>Gross:</strong> Rs ${e.grossTotal.toFixed(2)}
      </div>

      <div class="terms">
        <h4>Terms & Conditions</h4>
        <p>براۓ مہربانی! بغیر بل کے ادائیگی ہرگز نہ کریں۔ سیلز مین سے کسی بھی قسم کی ذاتی لین دین کی صورت میں ڈسٹری بیوٹر ذمہ دار نہیں ہوگا۔</p>
        <p>کسی بھی قسم کی شکایت کی صورت میں درج ذیل نمبر پر رابطہ کریں:</p>
        <p style="text-align:center;font-weight:bold;">0335-5314415</p>
        <p style="text-align:center;font-weight:bold;">منجانب: خلیل ٹریڈرز</p>
      </div>
    </div>

    <div class="summary-right">
      <div class="total-row"><span>Gross Total:</span><span>Rs ${e.grossTotal.toFixed(2)}</span></div>
      <div class="total-row"><span>Discount:</span><span>Rs ${e.discountAmount.toFixed(2)}</span></div>

      <div class="grand-total">
        <div class="total-row"><span>Grand Total:</span><span>Rs ${e.netTotal.toFixed(2)}</span></div>
      </div>

      <div style="text-align:center;font-style:italic;font-size:10px;">
        ${(e=>{var t;let a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],s=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],r=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];if(0===e)return"Zero";let l=e=>0===e?"":e<10?a[e]:e<20?r[e-10]:e<100?s[Math.floor(e/10)]+(e%10!=0?" "+a[e%10]:""):a[Math.floor(e/100)]+" Hundred"+(e%100!=0?" "+l(e%100):""),i=e=>e<1e3?l(e):l(Math.floor(e/1e3))+" Thousand"+(e%1e3!=0?" "+l(e%1e3):"");return((t=Math.floor(e))<1e5?i(t):l(Math.floor(t/1e5))+" Lakh"+(t%1e5!=0?" "+i(t%1e5):""))+" Only"})(e.netTotal)}
      </div>

      <div class="total-row"><span>Cash Received:</span><span>Rs ${e.amountPaid.toFixed(2)}</span></div>
      <div class="total-row"><span>Previous Balance:</span><span>Rs ${(e.previousBalance||0).toFixed(2)}</span></div>
      <div class="total-row" style="font-weight:bold;border-top:2px solid #000;">
        <span>Net Balance:</span><span>Rs ${(e.newBalance||0).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
            <p style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
              Thank you for your business!
            </p>
          </div>

  `),t.document.close(),setTimeout(()=>{t&&(t.focus(),t.print())},500)},ej=f.filter(e=>e.name.toLowerCase().includes(P.toLowerCase())||e.barcode?.toLowerCase().includes(P.toLowerCase())),eN=ef();return M?(0,t.jsx)("div",{className:"flex items-center justify-center py-12",children:(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("div",{className:"mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"}),(0,t.jsx)("p",{className:"text-sm text-zinc-600 dark:text-zinc-400",children:"Loading POS..."})]})}):(0,t.jsxs)("div",{className:"space-y-6",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-3xl font-bold",children:"Point of Sale"}),(0,t.jsx)("p",{className:"text-zinc-500 dark:text-zinc-400",children:"Create new sales and print invoices"})]}),(0,t.jsxs)("div",{className:"grid gap-6 lg:grid-cols-3",children:[(0,t.jsx)("div",{className:"lg:col-span-2 space-y-4",children:(0,t.jsxs)(r.Card,{children:[(0,t.jsx)(r.CardHeader,{children:(0,t.jsx)(r.CardTitle,{children:"Products"})}),(0,t.jsxs)(r.CardContent,{className:"space-y-4",children:[(0,t.jsxs)("div",{className:"relative",children:[(0,t.jsx)(p.Search,{className:"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"}),(0,t.jsx)(l.Input,{placeholder:"Search products...",value:P,onChange:e=>S(e.target.value),className:"pl-10"})]}),(0,t.jsx)("div",{className:"grid gap-2 max-h-[400px] overflow-y-auto",children:ej.map(e=>(0,t.jsxs)("div",{className:"flex items-center justify-between rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("p",{className:"font-medium",children:e.name}),(0,t.jsxs)("p",{className:"text-sm text-zinc-500",children:[(0,o.formatCurrency)(e.sellingPrice)," • Stock: ",e.stock]})]}),(0,t.jsx)(s.Button,{size:"sm",onClick:()=>(e=>{let t=$.find(t=>t.product._id===e._id);if(t)eh(e._id,t.qtyInUnits+1);else{let t=e.pcsPerUnit||1;T([...$,{product:e,qtyInUnits:1,totalPcs:t,price:e.sellingPrice,paidQty:t,freeQty:0}])}})(e),disabled:e.stock<=0,children:(0,t.jsx)(m.Plus,{className:"h-4 w-4"})})]},e._id))})]})]})}),(0,t.jsxs)("div",{className:"space-y-4",children:[(0,t.jsxs)(r.Card,{children:[(0,t.jsx)(r.CardHeader,{children:(0,t.jsxs)(r.CardTitle,{className:"flex items-center gap-2",children:[(0,t.jsx)(h.ShoppingCart,{className:"h-5 w-5"}),"Cart (",$.length,")"]})}),(0,t.jsxs)(r.CardContent,{className:"space-y-4",children:[0===$.length?(0,t.jsx)("p",{className:"text-center text-sm text-zinc-500 py-8",children:"Cart is empty"}):(0,t.jsx)("div",{className:"space-y-2 max-h-[300px] overflow-y-auto",children:$.map(e=>(0,t.jsxs)("div",{className:"flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800",children:[(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsx)("p",{className:"text-sm font-medium",children:e.product.name}),(0,t.jsxs)("p",{className:"text-xs text-zinc-500",children:[(0,o.formatCurrency)(e.price)," × ",e.qtyInUnits," ",e.product.unit,e.product.pcsPerUnit>1&&` (${e.totalPcs} pcs)`]})]}),(0,t.jsx)(s.Button,{size:"sm",variant:"destructive",onClick:()=>eg(e.product._id),children:(0,t.jsx)(x.Trash2,{className:"h-3 w-3"})})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)(s.Button,{size:"sm",variant:"outline",onClick:()=>eh(e.product._id,e.qtyInUnits-1),children:(0,t.jsx)(u,{className:"h-3 w-3"})}),(0,t.jsx)(l.Input,{type:"number",min:"1",value:e.qtyInUnits,onChange:t=>eh(e.product._id,parseInt(t.target.value)||1),className:"w-14 text-center text-sm h-8 px-1"}),(0,t.jsx)(s.Button,{size:"sm",variant:"outline",onClick:()=>eh(e.product._id,e.qtyInUnits+1),children:(0,t.jsx)(m.Plus,{className:"h-3 w-3"})})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"text-xs text-zinc-500",children:"Rs"}),(0,t.jsx)(l.Input,{type:"number",min:"0",step:"0.01",value:e.price,onChange:t=>{var a;let s;return a=e.product._id,s=parseFloat(t.target.value)||0,void T($.map(e=>e.product._id===a?{...e,price:s}:e))},className:"w-20 text-center text-sm h-8 px-1",title:"Override price per unit"})]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2 mt-1 border-t border-zinc-100 pt-2 dark:border-zinc-700",children:[(0,t.jsx)("span",{className:"text-xs text-green-600 dark:text-green-400 font-medium",children:"Scheme:"}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"text-xs text-zinc-500",children:"Paid:"}),(0,t.jsx)(l.Input,{type:"number",min:"0",value:e.paidQty||e.totalPcs,onChange:t=>ev(e.product._id,t.target.value,e.freeQty||0),className:"w-14 text-center text-sm h-7 px-1",title:"Paid quantity"})]}),(0,t.jsx)("span",{className:"text-xs font-bold",children:"+"}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{className:"text-xs text-zinc-500",children:"Free:"}),(0,t.jsx)(l.Input,{type:"number",min:"0",value:e.freeQty||0,onChange:t=>ev(e.product._id,e.paidQty||e.totalPcs,t.target.value),className:"w-14 text-center text-sm h-7 px-1 border-green-300 dark:border-green-700",title:"Free quantity"})]}),e.freeQty>0&&(0,t.jsxs)(d.Badge,{variant:"success",className:"text-xs",children:[e.paidQty,"+",e.freeQty]})]})]},e.product._id))}),(0,t.jsxs)("div",{className:"space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800",children:[(0,t.jsxs)("div",{className:"flex justify-between text-sm",children:[(0,t.jsx)("span",{children:"Gross Total:"}),(0,t.jsx)("span",{className:"font-medium",children:(0,o.formatCurrency)(eN.grossTotal)})]}),(0,t.jsxs)("div",{className:"flex justify-between text-sm",children:[(0,t.jsx)("span",{children:"Discount:"}),(0,t.jsxs)("span",{className:"font-medium text-red-600",children:["-",(0,o.formatCurrency)(eN.discountAmount)]})]}),(0,t.jsxs)("div",{className:"flex justify-between text-lg font-bold",children:[(0,t.jsx)("span",{children:"Net Total:"}),(0,t.jsx)("span",{children:(0,o.formatCurrency)(eN.netTotal)})]}),(0,t.jsxs)("div",{className:"flex justify-between text-sm",children:[(0,t.jsx)("span",{children:"Balance:"}),(0,t.jsx)(d.Badge,{variant:eN.balance>0?"destructive":"success",children:(0,o.formatCurrency)(eN.balance)})]})]})]})]}),(0,t.jsxs)(r.Card,{children:[(0,t.jsx)(r.CardHeader,{children:(0,t.jsx)(r.CardTitle,{children:"Payment Details"})}),(0,t.jsxs)(r.CardContent,{className:"space-y-4",children:[(0,t.jsxs)("div",{className:"space-y-4",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"areaFilter",children:"Filter by Area"}),(0,t.jsxs)(n.Select,{id:"areaFilter",value:k,onChange:e=>{I(e.target.value),A(""),el(e.target.value),V(""),es(""),et("")},children:[(0,t.jsx)("option",{value:"",children:"All Areas"}),N.map(e=>(0,t.jsx)("option",{value:e.name,children:e.name},e._id))]})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"customer",children:"Customer"}),(0,t.jsxs)(n.Select,{id:"customer",value:B,onChange:e=>(e=>{if(A(e),e){let t=y.find(t=>t._id===e);t&&(el(t.area||""),es(t.cnic||""),et(t.licenseNo||""))}else V(""),el(""),es(""),et("")})(e.target.value),children:[(0,t.jsx)("option",{value:"",children:"Walk-in Customer"}),y.filter(e=>!k||e.area===k).map(e=>(0,t.jsxs)("option",{value:e._id,children:[e.name," ",e.runningBalance>0?`(Bal: Rs ${e.runningBalance})`:""]},e._id))]})]}),B&&(e=y.find(e=>e._id===B),(v=e?.runningBalance||0)>0?(0,t.jsx)("div",{className:"rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800",children:(0,t.jsxs)("div",{className:"flex justify-between items-center",children:[(0,t.jsx)("span",{className:"text-sm font-medium text-amber-800 dark:text-amber-200",children:"Previous Balance:"}),(0,t.jsx)("span",{className:"text-lg font-bold text-amber-800 dark:text-amber-200",children:(0,o.formatCurrency)(v)})]})}):null)]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"customerNo",children:"Customer #"}),(0,t.jsx)(l.Input,{id:"customerNo",value:G,onChange:e=>V(e.target.value),placeholder:"Customer number"})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"area",children:"Area"}),(0,t.jsx)(l.Input,{id:"area",value:er,onChange:e=>el(e.target.value),placeholder:"Area"})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"deliveredBy",children:"Delivered By (Salesman)"}),(0,t.jsxs)(n.Select,{id:"deliveredBy",value:K,onChange:e=>{let t=e.target.value;W(t);let a=C.find(e=>e.name===t);a&&X(a.phone||"")},children:[(0,t.jsx)("option",{value:"",children:"Select Salesman"}),C.filter(e=>"salesman"===e.role).map(e=>(0,t.jsx)("option",{value:e.name,children:e.name},e._id))]})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"bookedBy",children:"Booked By (Order Booker)"}),(0,t.jsxs)(n.Select,{id:"bookedBy",value:Z,onChange:e=>{let t=e.target.value;J(t);let a=C.find(e=>e.name===t);a&&ec(a.phone||"")},children:[(0,t.jsx)("option",{value:"",children:"Select Order Booker"}),C.filter(e=>"order_booker"===e.role).map(e=>(0,t.jsx)("option",{value:e.name,children:e.name},e._id))]})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"deliveredByNo",children:"Delivered By #"}),(0,t.jsx)(l.Input,{id:"deliveredByNo",type:"number",value:Y,onChange:e=>X(e.target.value),placeholder:"Salesman number"})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"orderByNo",children:"Order By #"}),(0,t.jsx)(l.Input,{id:"orderByNo",type:"number",value:ed,onChange:e=>ec(e.target.value),placeholder:"Order by number"})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"licenseNo",children:"License #"}),(0,t.jsx)(l.Input,{id:"licenseNo",value:ee,onChange:e=>et(e.target.value),placeholder:"License number"})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"cnic",children:"CNIC"}),(0,t.jsx)(l.Input,{id:"cnic",value:ea,onChange:e=>es(e.target.value),placeholder:"CNIC number"})]})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"orderNo",children:"Order No"}),(0,t.jsx)(l.Input,{id:"orderNo",value:ei,onChange:e=>en(e.target.value),placeholder:"Order number"})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"dueDate",children:"Due Date"}),(0,t.jsx)(l.Input,{id:"dueDate",type:"date",value:eo,onChange:e=>ep(e.target.value)})]})]}),(0,t.jsxs)("div",{className:"space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20",children:[(0,t.jsx)(i.Label,{htmlFor:"invoiceDate",className:"text-blue-800 dark:text-blue-200",children:"Invoice Date"}),(0,t.jsx)(l.Input,{id:"invoiceDate",type:"date",value:em,onChange:e=>eu(e.target.value),className:"border-blue-300 dark:border-blue-700"}),(0,t.jsx)("p",{className:"text-xs text-blue-700 dark:text-blue-300",children:"Defaults to today. Select a different date if creating a bill for another day."})]}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"discount",children:"Discount"}),(0,t.jsx)(l.Input,{id:"discount",type:"number",step:"0.01",value:F,onChange:e=>R(parseFloat(e.target.value)||0),placeholder:"0"})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"discountType",children:"Type"}),(0,t.jsxs)(n.Select,{id:"discountType",value:L,onChange:e=>D(e.target.value),children:[(0,t.jsx)("option",{value:"percentage",children:"%"}),(0,t.jsx)("option",{value:"fixed",children:"Fixed"})]})]})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"paymentMethod",children:"Payment Method"}),(0,t.jsxs)(n.Select,{id:"paymentMethod",value:_,onChange:e=>O(e.target.value),children:[(0,t.jsx)("option",{value:"cash",children:"Cash"}),(0,t.jsx)("option",{value:"card",children:"Card"}),(0,t.jsx)("option",{value:"upi",children:"UPI"}),(0,t.jsx)("option",{value:"credit",children:"Credit"})]})]}),(0,t.jsxs)("div",{className:"space-y-2",children:[(0,t.jsx)(i.Label,{htmlFor:"amountPaid",children:"Amount Paid"}),(0,t.jsx)(l.Input,{id:"amountPaid",type:"number",step:"0.01",value:Q,onChange:e=>U(e.target.value),placeholder:"0.00"})]}),(0,t.jsxs)(s.Button,{className:"w-full",onClick:eb,disabled:H||0===$.length,children:[(0,t.jsx)(g.Printer,{className:"mr-2 h-4 w-4"}),H?"Processing...":"Complete Sale & Print"]})]})]})]})]})]})}e.s(["default",()=>v],64310)}]);