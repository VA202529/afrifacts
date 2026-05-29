/**
 * Professional Google Apps Script webshop.
 * Backend: Google Sheets, Google Drive, MailApp, LockService.
 *
 * Setup:
 * 1. Paste only Code.gs in Apps Script.
 * 2. Run setupDatabaseStructure once.
 * 3. Deploy as Web App.
 * 4. Host Index.html and Admin.html locally/externally.
 */

var APP = {
  VERSION: '2.0.0',
  TIMEZONE: Session.getScriptTimeZone() || 'Europe/Amsterdam',
  SESSION_HOURS: 24 * 14,
  RESET_MINUTES: 30,
  LOW_STOCK: 3,
  DEFAULT_ADMIN: {
    name: 'Standaard Admin',
    email: 'admin@webshop.local',
    password: 'Admin12345!'
  },
  PAYMENT_STATUSES: ['pending', 'payment_link_sent', 'paid', 'failed', 'refunded', 'cancelled'],
  FULFILLMENT_STATUSES: ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'picked_up', 'cancelled'],
  ORDER_STATUSES: ['new', 'accepted', 'processing', 'completed', 'cancelled', 'archived'],
  RETURN_STATUSES: ['requested', 'under_review', 'approved', 'rejected', 'received', 'refunded', 'closed', 'archived'],
  ROLES: {
    owner: ['*'],
    admin: ['dashboard:view', 'revenue:view', 'orders:view', 'orders:update', 'payments:update', 'returns:view', 'returns:update', 'reviews:view', 'reviews:update', 'customers:view', 'customers:write', 'products:view', 'products:write', 'staff:view', 'staff:write', 'settings:view', 'settings:write', 'logs:view'],
    accountant: ['dashboard:view', 'revenue:view', 'orders:view', 'exports:view'],
    product_manager: ['products:view', 'products:write', 'drive:manage'],
    order_manager: ['orders:view', 'orders:update', 'payments:update'],
    support: ['orders:view', 'returns:view', 'returns:update', 'reviews:view', 'reviews:update', 'customers:view', 'customers:write']
  },
  SHEETS: {
    products: ['product_id', 'id', 'created_at', 'updated_at', 'name', 'description', 'price', 'cost_price', 'sell_price', 'margin_percentage', 'vat_enabled', 'vat_percentage', 'price_ex_vat', 'price_inc_vat', 'stock', 'active', 'status', 'image_url', 'sku', 'category', 'shipping_class', 'discount_type', 'discount_value', 'drive_folder_id', 'drive_folder_url'],
    orders: ['order_id', 'created_at', 'updated_at', 'user_id', 'customer_name', 'email', 'phone', 'address', 'customer_city', 'customer_postal_code', 'delivery_type', 'status', 'payment_status', 'fulfillment_status', 'subtotal', 'discount_total', 'coupon_code', 'shipping_cost', 'vat_rate', 'vat_amount', 'total_excl_vat', 'total_price', 'payment_link', 'paid', 'track_trace', 'pickup_time', 'notes', 'last_email_sent'],
    order_items: ['item_id', 'order_id', 'product_id', 'product_name', 'price', 'cost_price', 'profit', 'quantity', 'line_total'],
    coupons: ['coupon_id', 'created_at', 'updated_at', 'code', 'discount_type', 'discount_value', 'active', 'expires_at', 'usage_limit', 'used_count'],
    product_images: ['image_id', 'product_id', 'drive_file_id', 'image_url', 'sort_order', 'created_at'],
    order_history: ['history_id', 'order_id', 'created_at', 'actor', 'action', 'old_value', 'new_value', 'notes'],
    settings: ['key', 'value'],
    bedrijf: ['key', 'value'],
    email_log: ['email_id', 'created_at', 'order_id', 'user_id', 'recipient', 'to', 'subject', 'template', 'type', 'target_type', 'target_id', 'status', 'resent', 'resent_count', 'error'],
    users: ['user_id', 'created_at', 'updated_at', 'name', 'email', 'phone', 'password_hash', 'role', 'active', 'last_login'],
    password_reset_tokens: ['token_id', 'user_id', 'email', 'token', 'created_at', 'expires_at', 'used', 'used_at'],
    sessions: ['token_id', 'created_at', 'expires_at', 'actor_type', 'actor_id', 'email', 'role', 'token', 'active', 'last_seen'],
    staff: ['staff_id', 'created_at', 'updated_at', 'name', 'email', 'password_hash', 'role', 'permissions', 'active', 'last_login'],
    returns: ['return_id', 'order_id', 'user_id', 'email', 'product_id', 'product_name', 'quantity', 'reason', 'status', 'requested_at', 'updated_at', 'admin_notes', 'refund_status'],
    reviews: ['review_id', 'created_at', 'updated_at', 'target_type', 'target_id', 'product_id', 'product_name', 'user_id', 'name', 'email', 'rating', 'title', 'message', 'status', 'admin_notes'],
    audit_log: ['log_id', 'created_at', 'actor_type', 'actor_id', 'actor_email', 'action', 'target_type', 'target_id', 'details']
  },
  DEFAULT_SETTINGS: {
    shop_name: 'Webshop System',
    store_name: 'Webshop System',
    store_status: 'open',
    shipping_cost: '6.95',
    free_shipping_above: '75',
    vat_percentage: '21',
    admin_email: 'admin@webshop.local',
    first_owner_email: 'admin@webshop.local',
    first_owner_password: 'Admin12345!',
    admin_frontend_url: '',
    customer_frontend_url: '',
    drive_products_root_folder_id: '',
    drive_products_root_folder_name: ''
  },
  DEFAULT_COMPANY: {
    website_name: 'Webshop System',
    company_name: 'Webshop System',
    brand_name: 'Webshop System',
    tagline: 'Bestel eenvoudig online',
    description: '',
    phone_1: '',
    phone_2: '',
    phone_3: '',
    email_1: '',
    email_2: '',
    email_3: '',
    address_street: '',
    address_house_number: '',
    address_postal_code: '',
    address_city: '',
    address_country: 'Nederland',
    kvk_number: '',
    btw_number: '',
    opening_monday: '',
    opening_tuesday: '',
    opening_wednesday: '',
    opening_thursday: '',
    opening_friday: '',
    opening_saturday: '',
    opening_sunday: '',
    website_url: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    youtube_url: '',
    linkedin_url: '',
    currency: 'EUR',
    language: 'nl',
    logo_url: '',
    favicon_url: '',
    shipping_enabled: 'true',
    pickup_enabled: 'true',
    shipping_provider: '',
    shipping_time: '',
    shipping_cost: '6.95',
    free_shipping_above: '75',
    return_policy: '',
    privacy_policy: '',
    terms_conditions: '',
    footer_text: '',
    credit_enabled: 'true',
    credit_text: 'Powered and made by Van Appiah',
    credit_url: 'https://vanappiah.com/',
    credit_label: 'VA'
  }
};

var ROW_CACHE_ = {};

function doGet(e) {
  if (param_(e, 'action')) return output_(route_('GET', e, null));
  return output_(ok_({ name: 'Webshop API', version: APP.VERSION, message: 'Gebruik ?action=company of POST JSON naar deze Web App URL.' }));
}

function doPost(e) {
  var body = parseBody_(e);
  return output_(route_('POST', e, body));
}

function apiClient(request) {
  return route_(clean_(request && request.method || 'POST').toUpperCase(), {}, request || {});
}

function setupDatabaseStructure() {
  ensureDatabase_(true);
  ensureInitialOwner_();
  cleanupDemoProducts_();
  return ok_({ version: APP.VERSION, sheets: Object.keys(APP.SHEETS) });
}

function route_(method, e, body) {
  try {
    ROW_CACHE_ = {};
    ensureDatabase_();
    var action = clean_((body && body.action) || param_(e, 'action'));
    var payload = body || {};
    if (!action) throw err_('Actie ontbreekt.', 400);

    var publicRoutes = {
      getSettings: getPublicSettings,
      settings: getPublicSettings,
      company: getCompany,
      getCompany: getCompany,
      getInitialProducts: getInitialProducts,
      getProductsPage: getProductsPage,
      getProducts: getProducts,
    getProductDetails: getProductDetails,
    products: getProducts,
      createOrder: createOrder,
      register: registerUser,
      login: loginUser,
      logout: logout,
      getProfile: getProfile,
      getMyOrders: getMyOrders,
      getMyOrderDetails: getMyOrderDetails,
      requestPasswordReset: requestPasswordReset,
      resetPassword: resetPassword,
      requestAdminPasswordCode: requestAdminPasswordCode,
      getOrderStatus: getOrderStatus,
      requestReturn: requestReturn,
      getReviews: getReviews,
      submitReview: submitReview
    };
    var adminRoutes = {
      adminLogin: adminLogin,
      getStaffSession: getStaffSession,
      changeStaffPassword: changeStaffPassword,
      getDashboardStats: getDashboardStats,
      getRevenueStats: getRevenueStats,
      getSoldProductsReport: getSoldProductsReport,
      getAccountingStats: getSoldProductsReport,
      getFinancialSummary: getSoldProductsReport,
      getProductProfit: getSoldProductsReport,
      refreshFinancialStats: getDashboardStats,
      getExpenses: removedAccountingAction_,
      createExpense: removedAccountingAction_,
      addExpense: removedAccountingAction_,
      updateExpense: removedAccountingAction_,
      deleteExpense: removedAccountingAction_,
      getFixedCosts: removedAccountingAction_,
      createFixedCost: removedAccountingAction_,
      addFixedCost: removedAccountingAction_,
      updateFixedCost: removedAccountingAction_,
      deleteFixedCost: removedAccountingAction_,
      exportFinancialData: removedAccountingAction_,
      emailFinancialReport: removedAccountingAction_,
      getOrders: getAdminOrders,
      getOrderDetails: getAdminOrderDetails,
      updateOrderStatus: updateOrderStatus,
      updatePaymentStatus: updatePaymentStatus,
      updateFulfillmentStatus: updateFulfillmentStatus,
      resendOrderEmail: resendOrderEmail,
      getReturns: getReturns,
      updateReturnStatus: updateReturnStatus,
      getReviewsAdmin: getReviewsAdmin,
      updateReviewStatus: updateReviewStatus,
      getCustomers: getCustomers,
      createCustomer: createCustomer,
      updateCustomer: updateCustomer,
      deactivateCustomer: deactivateCustomer,
      getProductsAdmin: getProductsAdmin,
      getAdminProducts: getProductsAdmin,
      createProduct: createProduct,
      updateProduct: updateProduct,
      deactivateProduct: deactivateProduct,
      archiveProduct: archiveProduct,
      restoreProduct: restoreProduct,
      duplicateProduct: duplicateProduct,
      syncProductImages: syncProductImages,
      syncAllProductImages: syncAllProductImages,
      runSystemCheck: runSystemCheck,
      installAutomationTriggers: installAutomationTriggers,
      deleteProduct: deactivateProduct,
      getCoupons: getCoupons,
      getDiscounts: getCoupons,
      createCoupon: createCoupon,
      createDiscount: createCoupon,
      updateCoupon: updateCoupon,
      deactivateCoupon: deactivateCoupon,
      getStaff: getStaff,
      createStaff: createStaff,
      updateStaff: updateStaff,
      deactivateStaff: deactivateStaff,
      sendStaffPasswordReset: sendStaffPasswordReset,
      getEmailLog: getEmailLog,
      getEmails: getEmailLog,
      getAuditLog: getAuditLog,
      getLogs: getAuditLog,
      getSettingsAdmin: getSettingsAdmin,
      updateSetting: updateSetting,
      getCompanySettings: getCompanySettings,
      updateCompanySettings: updateCompanySettings
    };

    if (publicRoutes[action]) return publicRoutes[action](payload, e);
    if (adminRoutes[action]) return adminRoutes[action](payload, e);
    throw err_('Onbekende actie: ' + action, 404);
  } catch (error) {
    return fail_(error.message || 'Er ging iets mis.', error.code || 500);
  }
}

function getPublicSettings() {
  var settings = getCompanyMap_();
  return ok_(publicSettings_(settings));
}

function getCompany() {
  return ok_(getCompanyMap_());
}

function getProducts() {
  var cache = CacheService.getScriptCache();
  try {
    var cached = cache.get('public_products_v3');
    if (cached) return ok_(JSON.parse(cached));
  } catch (cacheError) {}
  var rows = rows_('products').filter(isPublicProduct_);
  var imageMap = productImageMap_();
  var data = rows.map(function(p) { return publicProduct_(p, imageMap); });
  try { cache.put('public_products_v3', JSON.stringify(data), 180); } catch (cacheError2) {}
  return ok_(data);
}

function getInitialProducts(payload) {
  var limit = Math.min(Math.max(num_((payload && payload.limit) || 4), 2), 4);
  return ok_(getFastProductsPage_(0, limit, 'initial_products_v1_' + limit));
}

function getProductsPage(payload) {
  var offset = Math.max(0, Math.floor(num_((payload && payload.offset) || 0)));
  var limit = Math.min(Math.max(num_((payload && payload.limit) || 12), 4), 24);
  return ok_(getFastProductsPage_(offset, limit, 'products_page_v1_' + offset + '_' + limit));
}

function getFastProductsPage_(offset, limit, cacheKey) {
  var cache = CacheService.getScriptCache();
  try {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheError) {}

  var sheet = sheet_('products');
  var last = sheet.getLastRow();
  var headers = getHeaders_(sheet);
  if (last < 2) return { products: [], offset: offset, limit: limit, next_offset: offset, has_more: false };

  var indexes = {
    product_id: headers.indexOf('product_id'),
    id: headers.indexOf('id'),
    name: headers.indexOf('name'),
    price: headers.indexOf('price'),
    sell_price: headers.indexOf('sell_price'),
    price_inc_vat: headers.indexOf('price_inc_vat'),
    image_url: headers.indexOf('image_url'),
    stock: headers.indexOf('stock'),
    status: headers.indexOf('status'),
    active: headers.indexOf('active'),
    sku: headers.indexOf('sku'),
    category: headers.indexOf('category')
  };
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  var products = [];
  var seenActive = 0;
  var hasMore = false;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var status = clean_(valueAt_(row, indexes.status) || 'active');
    var activeValue = valueAt_(row, indexes.active);
    var active = indexes.active === -1 ? true : bool_(activeValue);
    var stock = num_(valueAt_(row, indexes.stock));
    if (!active || status === 'archived' || status === 'draft') continue;
    if (seenActive++ < offset) continue;
    if (products.length >= limit) {
      hasMore = true;
      break;
    }
    var productId = clean_(valueAt_(row, indexes.product_id) || valueAt_(row, indexes.id));
    var price = money_(valueAt_(row, indexes.sell_price) || valueAt_(row, indexes.price_inc_vat) || valueAt_(row, indexes.price));
    products.push({
      product_id: productId,
      id: productId,
      name: clean_(valueAt_(row, indexes.name)),
      price: price,
      sell_price: price,
      image_url: convertDriveUrlToThumbnail_(valueAt_(row, indexes.image_url), 700),
      stock: stock,
      status: status,
      sku: clean_(valueAt_(row, indexes.sku)),
      category: clean_(valueAt_(row, indexes.category)),
      fast: true
    });
  }

  var data = { products: products, offset: offset, limit: limit, next_offset: offset + products.length, has_more: hasMore };
  try { cache.put(cacheKey, JSON.stringify(data), 180); } catch (cacheError2) {}
  return data;
}

function getProductDetails(payload) {
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row || !isPublicProduct_(row.record)) {
    throw err_('Product niet gevonden.', 404);
  }
  return ok_(publicProduct_(row.record));
}

function registerUser(payload) {
  validateRequired_(payload, ['name', 'email', 'phone', 'password']);
  validateEmail_(payload.email);
  validatePhone_(payload.phone);
  validatePassword_(payload.password);
  var email = clean_(payload.email).toLowerCase();
  if (findRow_('users', 'email', email)) throw err_('Er bestaat al een account met dit e-mailadres.', 409);
  var now = now_();
  var user = {
    user_id: id_('USR'),
    created_at: now,
    updated_at: now,
    name: clean_(payload.name),
    email: email,
    phone: clean_(payload.phone),
    password_hash: hashPassword_(payload.password),
    role: 'customer',
    active: true,
    last_login: ''
  };
  append_('users', user);
  var session = createSession_('user', user.user_id, user.email, 'customer');
  return ok_({ token: session.token, user: safeUser_(user) });
}

function loginUser(payload) {
  validateRequired_(payload, ['email', 'password']);
  var row = findRow_('users', 'email', clean_(payload.email).toLowerCase());
  if (!row || !bool_(row.record.active) || !verifyPassword_(payload.password, row.record.password_hash)) {
    throw err_('E-mailadres of wachtwoord klopt niet.', 401);
  }
  updateByRow_('users', row.row, { last_login: now_(), updated_at: now_() });
  var session = createSession_('user', row.record.user_id, row.record.email, 'customer');
  return ok_({ token: session.token, user: safeUser_(row.record) });
}

function adminLogin(payload) {
  validateRequired_(payload, ['email', 'password']);
  ensureInitialOwner_();
  var email = clean_(payload.email).toLowerCase();
  var row = findRow_('staff', 'email', email);
  var passwordOk = row && bool_(row.record.active) && verifyPassword_(payload.password, row.record.password_hash);
  var codeOk = !passwordOk && row && bool_(row.record.active) ? verifyStaffResetCode_(email, payload.password) : false;
  if (!row || !bool_(row.record.active) || (!passwordOk && !codeOk)) {
    throw err_('Adminlogin mislukt.', 401);
  }
  var loginPatch = { last_login: now_(), updated_at: now_() };
  if (codeOk) loginPatch.password_hash = hashPassword_(payload.password);
  updateByRow_('staff', row.row, loginPatch);
  var permissions = permissionsForRole_(row.record.role, row.record.permissions);
  var session = createSession_('staff', row.record.staff_id, row.record.email, row.record.role);
  return ok_({ token: session.token, staff: safeStaff_(row.record), permissions: permissions });
}

function getStaffSession(payload) {
  var session = requireSession_(payload, 'staff');
  var staffRow = findRow_('staff', 'staff_id', session.actor_id);
  if (!staffRow || !bool_(staffRow.record.active)) throw err_('Geen toegang.', 401);
  return ok_({ staff: safeStaff_(staffRow.record), permissions: permissionsForRole_(staffRow.record.role, staffRow.record.permissions) });
}

function requestAdminPasswordCode(payload) {
  validateRequired_(payload, ['email']);
  validateEmail_(payload.email);
  var email = clean_(payload.email).toLowerCase();
  var row = findRow_('staff', 'email', email);
  if (row && bool_(row.record.active)) {
    createPasswordCodeForActor_(row.record.staff_id, email, row.record.name || email, 'staff');
  }
  return ok_({ message: 'Als dit e-mailadres bestaat, is er een herstelcode verzonden.' });
}

function changeStaffPassword(payload) {
  var session = requireSession_(payload, 'staff');
  var staffRow = findRow_('staff', 'staff_id', session.actor_id);
  if (!staffRow || !bool_(staffRow.record.active)) throw err_('Geen toegang.', 401);
  validateRequired_(payload, ['current_password', 'new_password']);
  validatePassword_(payload.new_password);
  if (!verifyPassword_(payload.current_password, staffRow.record.password_hash)) {
    throw err_('Huidig wachtwoord klopt niet.', 401);
  }
  updateByRow_('staff', staffRow.row, { password_hash: hashPassword_(payload.new_password), updated_at: now_() });
  audit_({ actor_type: 'staff', actor_id: staffRow.record.staff_id, actor_email: staffRow.record.email }, 'staff_password_changed', 'staff', staffRow.record.staff_id, {});
  return ok_({ changed: true });
}

function logout(payload) {
  var token = bearer_(payload);
  if (token) {
    var row = findRow_('sessions', 'token', token);
    if (row) updateByRow_('sessions', row.row, { active: false, last_seen: now_() });
  }
  return ok_({ logged_out: true });
}

function getProfile(payload) {
  var auth = requireUser_(payload);
  return ok_({ user: safeUser_(auth.user) });
}

function getMyOrders(payload) {
  var auth = requireUser_(payload);
  var orders = rows_('orders').filter(function(o) { return clean_(o.user_id) === auth.user.user_id || clean_(o.email).toLowerCase() === auth.user.email; });
  return ok_(orders.map(publicOrderSummary_));
}

function getMyOrderDetails(payload) {
  var auth = requireUser_(payload);
  validateRequired_(payload, ['order_id']);
  var order = getOrder_(payload.order_id);
  if (clean_(order.user_id) !== auth.user.user_id && clean_(order.email).toLowerCase() !== auth.user.email) throw err_('Order niet gevonden.', 404);
  return ok_(publicOrderDetails_(order));
}

function requestPasswordReset(payload) {
  validateRequired_(payload, ['email']);
  validateEmail_(payload.email);
  var email = clean_(payload.email).toLowerCase();
  var userRow = findRow_('users', 'email', email);
  var staffRow = findRow_('staff', 'email', email);
  var actor = userRow ? userRow.record : staffRow ? staffRow.record : null;
  var actorId = userRow ? actor.user_id : staffRow ? actor.staff_id : '';
  if (actor) {
    createPasswordResetForActor_(actorId, email, actor.name || email, userRow ? 'user' : 'staff', 'Wachtwoord resetten');
  }
  return ok_({ message: 'Als dit e-mailadres bekend is, ontvang je een resetlink.' });
}

function resetPassword(payload) {
  validateRequired_(payload, ['token', 'password']);
  validatePassword_(payload.password);
  var resetRow = findRow_('password_reset_tokens', 'token', clean_(payload.token));
  if (!resetRow || bool_(resetRow.record.used) || new Date(resetRow.record.expires_at).getTime() < Date.now()) {
    throw err_('Resetlink is ongeldig of verlopen.', 400);
  }
  var hash = hashPassword_(payload.password);
  var userRow = findRow_('users', 'user_id', resetRow.record.user_id);
  var staffRow = findRow_('staff', 'staff_id', resetRow.record.user_id);
  if (userRow) updateByRow_('users', userRow.row, { password_hash: hash, updated_at: now_() });
  if (staffRow) updateByRow_('staff', staffRow.row, { password_hash: hash, updated_at: now_() });
  updateByRow_('password_reset_tokens', resetRow.row, { used: true, used_at: now_() });
  return ok_({ reset: true });
}

function createOrder(payload) {
  validateRequired_(payload, ['customer_name', 'email', 'phone', 'delivery_type', 'items']);
  validateEmail_(payload.email);
  validatePhone_(payload.phone);
  if (['verzenden', 'ophalen'].indexOf(clean_(payload.delivery_type)) === -1) throw err_('Kies verzenden of ophalen.', 400);
  if (!Array.isArray(payload.items) || payload.items.length === 0) throw err_('Winkelwagen is leeg.', 400);

  var createdOrder = null;
  var result = withLock_(function() {
    var products = mapBy_(rows_('products'), 'product_id');
    var legacy = mapBy_(rows_('products'), 'id');
    var normalizedItems = [];
    var subtotal = 0;
    var productDiscountTotal = 0;
    payload.items.forEach(function(item) {
      var productId = clean_(item.product_id || item.id);
      var product = products[productId] || legacy[productId];
      var qty = Math.floor(num_(item.quantity));
      if (!product || !bool_(product.active)) throw err_('Product bestaat niet: ' + productId, 400);
      if (qty < 1) throw err_('Aantal moet minimaal 1 zijn.', 400);
      if (num_(product.stock) - qty < 0) throw err_('Onvoldoende voorraad voor ' + product.name + '.', 409);
      var price = money_(product.price);
      var lineBase = price * qty;
      var lineDiscount = discountAmount_(lineBase, product.discount_type, product.discount_value);
      productDiscountTotal += lineDiscount;
      subtotal += lineBase - lineDiscount;
      normalizedItems.push({ product: product, quantity: qty, price: price, line_discount: lineDiscount });
    });

    normalizedItems.forEach(function(item) {
      var row = findRowAny_('products', ['product_id', 'id'], item.product.product_id || item.product.id);
      updateByRow_('products', row.row, { stock: num_(item.product.stock) - item.quantity, updated_at: now_() });
    });

    var company = getCompanyMap_();
    var coupon = getValidCoupon_(payload.coupon_code);
    var couponDiscount = coupon ? discountAmount_(subtotal, coupon.discount_type, coupon.discount_value) : 0;
    var discountTotal = money_(productDiscountTotal + couponDiscount);
    subtotal = money_(subtotal - couponDiscount);
    var shipping = clean_(payload.delivery_type) === 'ophalen' ? 0 : shippingFor_(subtotal, company);
    var vatRate = num_(company.vat_percentage || 21);
    var totalIncl = money_(subtotal + shipping);
    var totalExcl = money_(totalIncl / (1 + vatRate / 100));
    var vatAmount = money_(totalIncl - totalExcl);
    var user = null;
    if (bearer_(payload)) {
      try { user = requireUser_(payload).user; } catch (ignore) {}
    } else {
      var userRow = findRow_('users', 'email', clean_(payload.email).toLowerCase());
      user = userRow ? userRow.record : null;
    }
    var order = {
      order_id: id_('ORD'),
      created_at: now_(),
      updated_at: now_(),
      user_id: user ? user.user_id : '',
      customer_name: clean_(payload.customer_name),
      email: clean_(payload.email).toLowerCase(),
      phone: clean_(payload.phone),
      address: clean_(payload.address),
      customer_city: clean_(payload.customer_city),
      customer_postal_code: clean_(payload.customer_postal_code),
      delivery_type: clean_(payload.delivery_type),
      status: 'new',
      payment_status: 'pending',
      fulfillment_status: 'pending',
      subtotal: money_(subtotal),
      discount_total: discountTotal,
      coupon_code: coupon ? coupon.code : clean_(payload.coupon_code).toUpperCase(),
      shipping_cost: money_(shipping),
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_excl_vat: totalExcl,
      total_price: totalIncl,
      payment_link: '',
      paid: false,
      track_trace: '',
      pickup_time: clean_(payload.pickup_time),
      notes: clean_(payload.notes),
      last_email_sent: ''
    };
    append_('orders', order);
    normalizedItems.forEach(function(item) {
      append_('order_items', {
        item_id: id_('ITM'),
        order_id: order.order_id,
        product_id: item.product.product_id || item.product.id,
        product_name: item.product.name,
        price: item.price,
        cost_price: money_(item.product.cost_price),
        profit: money_((item.price - num_(item.product.cost_price)) * item.quantity - item.line_discount),
        quantity: item.quantity,
        line_total: money_(item.price * item.quantity - item.line_discount)
      });
    });
    if (coupon) incrementCouponUse_(coupon.code);
    createdOrder = order;
    logOrderHistory_(order.order_id, 'system', 'order_created', '', order.status, 'Order aangemaakt');
    return { order_id: order.order_id, total_price: order.total_price, payment_status: order.payment_status, fulfillment_status: order.fulfillment_status };
  });
  try {
    if (createdOrder) sendOrderMail_(createdOrder, 'order_created');
  } catch (mailError) {
    console.error(mailError);
  }
  return ok_(result);
}

function getOrderStatus(payload) {
  validateRequired_(payload, ['order_id']);
  var order = getOrder_(payload.order_id);
  if (bearer_(payload)) {
    var auth = requireUser_(payload);
    if (order.user_id !== auth.user.user_id && clean_(order.email).toLowerCase() !== auth.user.email) throw err_('Order niet gevonden.', 404);
  } else {
    validateRequired_(payload, ['email']);
    if (clean_(order.email).toLowerCase() !== clean_(payload.email).toLowerCase()) throw err_('Order niet gevonden.', 404);
  }
  return ok_(publicOrderDetails_(order));
}

function requestReturn(payload) {
  var auth = requireUser_(payload);
  validateRequired_(payload, ['order_id', 'product_id', 'quantity', 'reason']);
  var order = getOrder_(payload.order_id);
  if (order.user_id !== auth.user.user_id && clean_(order.email).toLowerCase() !== auth.user.email) throw err_('Order niet gevonden.', 404);
  var item = getOrderItems_(order.order_id).filter(function(i) { return clean_(i.product_id) === clean_(payload.product_id); })[0];
  if (!item) throw err_('Product staat niet in deze order.', 400);
  var qty = Math.floor(num_(payload.quantity));
  if (qty < 1 || qty > num_(item.quantity)) throw err_('Ongeldig retouraantal.', 400);
  var ret = {
    return_id: id_('RET'),
    order_id: order.order_id,
    user_id: auth.user.user_id,
    email: auth.user.email,
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: qty,
    reason: clean_(payload.reason),
    status: 'requested',
    requested_at: now_(),
    updated_at: now_(),
    admin_notes: '',
    refund_status: 'pending'
  };
  append_('returns', ret);
  audit_({ actor_type: 'user', actor_id: auth.user.user_id, actor_email: auth.user.email }, 'return_requested', 'return', ret.return_id, ret);
  return ok_(ret);
}

function getReviews(payload) {
  var targetType = clean_((payload && payload.target_type) || 'company');
  var targetId = clean_(payload && (payload.target_id || payload.product_id));
  if (['company', 'product'].indexOf(targetType) === -1) throw err_('Ongeldig reviewtype.', 400);
  var reviews = rows_('reviews').filter(function(r) {
    if (clean_(r.status || 'approved') !== 'approved') return false;
    if (clean_(r.target_type || 'company') !== targetType) return false;
    if (targetType === 'product' && clean_(r.target_id || r.product_id) !== targetId) return false;
    return true;
  }).sort(sortCreatedDesc_).slice(0, Math.min(Math.max(num_(payload && payload.limit || 12), 1), 50)).map(publicReview_);
  return ok_({ reviews: reviews, average_rating: averageRating_(reviews), count: reviews.length });
}

function submitReview(payload) {
  validateRequired_(payload, ['target_type', 'name', 'email', 'rating', 'message']);
  validateEmail_(payload.email);
  var targetType = clean_(payload.target_type);
  if (['company', 'product'].indexOf(targetType) === -1) throw err_('Kies bedrijf of product.', 400);
  var rating = Math.floor(num_(payload.rating));
  if (rating < 1 || rating > 5) throw err_('Rating moet tussen 1 en 5 zijn.', 400);
  var user = null;
  if (bearer_(payload)) {
    try { user = requireUser_(payload).user; } catch (ignore) {}
  }
  var product = {};
  var targetId = '';
  if (targetType === 'product') {
    validateRequired_(payload, ['product_id']);
    var productRow = findRowAny_('products', ['product_id', 'id'], payload.product_id);
    if (!productRow || !bool_(productRow.record.active) || clean_(productRow.record.status || 'active') === 'archived') throw err_('Product niet gevonden.', 404);
    product = productRow.record;
    targetId = product.product_id || product.id;
  } else {
    targetId = 'company';
  }
  var review = {
    review_id: id_('REV'),
    created_at: now_(),
    updated_at: now_(),
    target_type: targetType,
    target_id: targetId,
    product_id: targetType === 'product' ? targetId : '',
    product_name: targetType === 'product' ? product.name : '',
    user_id: user ? user.user_id : '',
    name: clean_(payload.name).slice(0, 80),
    email: clean_(payload.email).toLowerCase(),
    rating: rating,
    title: clean_(payload.title).slice(0, 120),
    message: clean_(payload.message).slice(0, 1200),
    status: 'pending',
    admin_notes: ''
  };
  append_('reviews', review);
  audit_({ actor_type: user ? 'user' : 'public', actor_id: user ? user.user_id : '', actor_email: review.email }, 'review_submitted', targetType, targetId, { review_id: review.review_id, rating: rating });
  return ok_({ review_id: review.review_id, status: review.status, message: 'Bedankt. Je review wordt na controle zichtbaar.' });
}

function getReviewsAdmin(payload) {
  requireStaff_(payload, 'reviews:view');
  var status = clean_(payload.status || '');
  var rows = rows_('reviews').filter(function(r) { return !status || clean_(r.status || 'pending') === status; }).sort(sortCreatedDesc_);
  return ok_(rows.slice(0, Math.min(Math.max(num_(payload.limit || 120), 20), 300)));
}

function updateReviewStatus(payload) {
  var auth = requireStaff_(payload, 'reviews:update');
  validateRequired_(payload, ['review_id', 'status']);
  var status = clean_(payload.status);
  if (['pending', 'approved', 'rejected', 'archived'].indexOf(status) === -1) throw err_('Ongeldige reviewstatus.', 400);
  var row = findRow_('reviews', 'review_id', clean_(payload.review_id));
  if (!row) throw err_('Review niet gevonden.', 404);
  updateByRow_('reviews', row.row, { status: status, admin_notes: clean_(payload.admin_notes), updated_at: now_() });
  audit_(auth, 'review_status_updated', 'review', row.record.review_id, { old_status: row.record.status, status: status });
  return ok_({ updated: true });
}

function getDashboardStats(payload) {
  var auth = requireStaff_(payload, 'dashboard:view');
  var cache = CacheService.getScriptCache();
  var cacheKey = 'dashboard_stats_v3';
  if (!payload.refresh) {
    var cached = cache.get(cacheKey);
    if (cached) {
      var cachedData = JSON.parse(cached);
      cachedData.actor = safeStaff_(auth.staff);
      cachedData.cached = true;
      return ok_(cachedData);
    }
  }
  var orders = rows_('orders');
  var returns = rows_('returns');
  var products = rows_('products');
  var paid = orders.filter(function(o) { return o.payment_status === 'paid' || bool_(o.paid); });
  var revenue = paid.reduce(function(s, o) { return s + num_(o.total_price); }, 0);
  var today = ymd_(new Date());
  var weekStart = startOfWeek_(new Date()).getTime();
  var month = today.slice(0, 7);
  var orderItems = rows_('order_items');
  var productSales = {};
  orderItems.forEach(function(i) {
    productSales[i.product_name] = (productSales[i.product_name] || 0) + num_(i.quantity);
  });
  var best = Object.keys(productSales).map(function(name) { return { name: name, quantity: productSales[name] }; }).sort(function(a, b) { return b.quantity - a.quantity; }).slice(0, 8);
  var data = {
    total_revenue: money_(revenue),
    revenue_today: money_(paid.filter(function(o) { return ymd_(o.created_at) === today; }).reduce(sumTotal_, 0)),
    revenue_week: money_(paid.filter(function(o) { return new Date(o.created_at).getTime() >= weekStart; }).reduce(sumTotal_, 0)),
    revenue_month: money_(paid.filter(function(o) { return ymd_(o.created_at).slice(0, 7) === month; }).reduce(sumTotal_, 0)),
    order_count: orders.length,
    paid_order_count: paid.length,
    open_payments: orders.filter(function(o) { return ['pending', 'payment_link_sent', 'failed'].indexOf(o.payment_status) !== -1; }).length,
    average_order_value: money_(paid.length ? revenue / paid.length : 0),
    best_selling_products: best,
    low_stock_products: products.filter(function(p) { return bool_(p.active) && num_(p.stock) <= APP.LOW_STOCK; }).map(publicProduct_),
    return_requests: returns.filter(function(r) { return ['requested', 'under_review'].indexOf(r.status) !== -1; }).length,
    recent_orders: orders.sort(sortCreatedDesc_).slice(0, 10).map(adminOrderSummary_),
    customer_count: rows_('users').length,
    actor: safeStaff_(auth.staff),
    cached: false
  };
  var cacheCopy = JSON.parse(JSON.stringify(data));
  delete cacheCopy.actor;
  cache.put(cacheKey, JSON.stringify(cacheCopy), 120);
  return ok_(data);
}

function getRevenueStats(payload) {
  requireStaff_(payload, 'revenue:view');
  var paid = rows_('orders').filter(function(o) { return o.payment_status === 'paid' || bool_(o.paid); });
  return ok_({ orders: paid.map(adminOrderSummary_), total: money_(paid.reduce(sumTotal_, 0)) });
}

function getSoldProductsReport(payload) {
  requireStaff_(payload, 'revenue:view');
  var cache = CacheService.getScriptCache();
  var key = 'sold_products_v2_' + clean_(payload && payload.period || 'all') + '_' + clean_(payload && payload.date_from || '') + '_' + clean_(payload && payload.date_to || '');
  if (!payload.refresh) {
    var cached = cache.get(key);
    if (cached) return ok_(JSON.parse(cached));
  }
  var range = resolveDateRange_(payload || {});
  var orders = rows_('orders').filter(function(o) {
    return isInDateRange_(o.created_at, range) && ['cancelled', 'refunded'].indexOf(clean_(o.payment_status)) === -1 && clean_(o.status) !== 'cancelled';
  });
  var orderMap = {};
  orders.forEach(function(o) { orderMap[clean_(o.order_id)] = o; });
  var products = {};
  rows_('products').forEach(function(p) { products[clean_(p.product_id || p.id)] = p; });
  var rowsOut = {};
  rows_('order_items').forEach(function(item) {
    var order = orderMap[clean_(item.order_id)];
    if (!order) return;
    var id = clean_(item.product_id || item.product_name);
    var product = products[id] || {};
    var qty = num_(item.quantity);
    var revenue = money_(item.line_total || num_(item.price) * qty);
    var cost = money_((item.cost_price !== '' && item.cost_price !== undefined ? num_(item.cost_price) : num_(product.cost_price)) * qty);
    if (!rowsOut[id]) {
      rowsOut[id] = { product_id: id, name: item.product_name || product.name, sku: product.sku || '', quantity: 0, revenue: 0, cost: 0, gross_profit: 0, margin_percentage: 0, stock: num_(product.stock), status: product.status || 'active' };
    }
    rowsOut[id].quantity += qty;
    rowsOut[id].revenue += revenue;
    rowsOut[id].cost += cost;
    rowsOut[id].gross_profit += revenue - cost;
  });
  var sold = Object.keys(rowsOut).map(function(id) {
    var p = rowsOut[id];
    p.revenue = money_(p.revenue);
    p.cost = money_(p.cost);
    p.gross_profit = money_(p.gross_profit);
    p.margin_percentage = p.revenue > 0 ? money_(p.gross_profit / p.revenue * 100) : 0;
    return p;
  }).sort(function(a, b) { return b.gross_profit - a.gross_profit; });
  var totalRevenue = sold.reduce(function(sum, p) { return sum + num_(p.revenue); }, 0);
  var totalCost = sold.reduce(function(sum, p) { return sum + num_(p.cost); }, 0);
  var data = {
    period: clean_(payload && payload.period || 'all'),
    total_revenue: money_(totalRevenue),
    total_cost: money_(totalCost),
    gross_profit: money_(totalRevenue - totalCost),
    sold_quantity: sold.reduce(function(sum, p) { return sum + num_(p.quantity); }, 0),
    products: sold,
    recent_orders: orders.sort(sortCreatedDesc_).slice(0, 12).map(adminOrderSummary_),
    cached: false
  };
  cache.put(key, JSON.stringify(data), 90);
  return ok_(data);
}

function removedAccountingAction_() {
  return ok_({ removed: true, message: 'Het oude administratiepaneel is verwijderd. Gebruik Verkochte producten voor lichte webshopstatistieken.' });
}

function getAdminOrders(payload) {
  requireStaff_(payload, 'orders:view');
  var limit = Math.min(Math.max(num_(payload.limit || 80), 20), 250);
  return ok_(rows_('orders').sort(sortCreatedDesc_).slice(0, limit).map(adminOrderSummary_));
}

function getAdminOrderDetails(payload) {
  requireStaff_(payload, 'orders:view');
  validateRequired_(payload, ['order_id']);
  return ok_(adminOrderDetails_(getOrder_(payload.order_id)));
}

function updateOrderStatus(payload) {
  var auth = requireStaff_(payload, 'orders:update');
  validateRequired_(payload, ['order_id', 'status']);
  if (APP.ORDER_STATUSES.indexOf(clean_(payload.status)) === -1) throw err_('Ongeldige orderstatus.', 400);
  return updateOrderField_(auth, payload.order_id, { status: clean_(payload.status), updated_at: now_() }, 'order_status_updated');
}

function updatePaymentStatus(payload) {
  var auth = requireStaff_(payload, 'payments:update');
  validateRequired_(payload, ['order_id', 'payment_status']);
  var status = clean_(payload.payment_status);
  if (APP.PAYMENT_STATUSES.indexOf(status) === -1) throw err_('Ongeldige betaalstatus.', 400);
  var patch = { payment_status: status, paid: status === 'paid', updated_at: now_() };
  if (payload.payment_link !== undefined) patch.payment_link = clean_(payload.payment_link);
  if (patch.payment_link && status === 'pending') {
    patch.payment_status = 'payment_link_sent';
  }
  var result = updateOrderField_(auth, payload.order_id, patch, 'payment_status_updated');
  if (status === 'paid' || status === 'payment_link_sent' || status === 'refunded') sendOrderMail_(getOrder_(payload.order_id), 'payment_' + status);
  return result;
}

function updateFulfillmentStatus(payload) {
  var auth = requireStaff_(payload, 'orders:update');
  validateRequired_(payload, ['order_id', 'fulfillment_status']);
  var status = clean_(payload.fulfillment_status);
  if (APP.FULFILLMENT_STATUSES.indexOf(status) === -1) throw err_('Ongeldige leveringsstatus.', 400);
  var patch = { fulfillment_status: status, updated_at: now_() };
  if (payload.track_trace !== undefined) patch.track_trace = clean_(payload.track_trace);
  if (payload.pickup_time !== undefined) patch.pickup_time = clean_(payload.pickup_time);
  var result = updateOrderField_(auth, payload.order_id, patch, 'fulfillment_status_updated');
  if (['shipped', 'delivered', 'ready_for_pickup', 'picked_up'].indexOf(status) !== -1) sendOrderMail_(getOrder_(payload.order_id), 'fulfillment_' + status);
  return result;
}

function resendOrderEmail(payload) {
  var auth = requireStaff_(payload, 'orders:update');
  validateRequired_(payload, ['order_id', 'template']);
  var order = getOrder_(payload.order_id);
  sendOrderMail_(order, clean_(payload.template));
  audit_(auth, 'order_email_resent', 'order', order.order_id, { template: payload.template });
  logOrderHistory_(order.order_id, auth.actor_email, 'mail_resent', '', payload.template, 'Mail opnieuw verstuurd');
  return ok_({ order_id: order.order_id, template: payload.template, sent: true });
}

function getReturns(payload) {
  requireStaff_(payload, 'returns:view');
  return ok_(rows_('returns').sort(sortRequestedDesc_));
}

function updateReturnStatus(payload) {
  var auth = requireStaff_(payload, 'returns:update');
  validateRequired_(payload, ['return_id', 'status']);
  var status = clean_(payload.status);
  if (APP.RETURN_STATUSES.indexOf(status) === -1) throw err_('Ongeldige retourstatus.', 400);
  var row = findRow_('returns', 'return_id', payload.return_id);
  if (!row) throw err_('Retour niet gevonden.', 404);
  updateByRow_('returns', row.row, { status: status, updated_at: now_(), admin_notes: clean_(payload.admin_notes), refund_status: clean_(payload.refund_status || row.record.refund_status) });
  var updated = findRow_('returns', 'return_id', payload.return_id).record;
  sendEmail_(updated.email, 'Update over je retour ' + updated.return_id, simpleMail_('Retourstatus bijgewerkt', 'Je retour heeft nu status: ' + status + '.'), 'return_update', 'return', updated.return_id);
  audit_(auth, 'return_status_updated', 'return', updated.return_id, updated);
  return ok_(updated);
}

function getCustomers(payload) {
  requireStaff_(payload, 'customers:view');
  return ok_(rows_('users').map(safeUser_));
}

function createCustomer(payload) {
  var auth = requireStaff_(payload, 'customers:write');
  validateRequired_(payload, ['name', 'email']);
  validateEmail_(payload.email);
  if (payload.phone) validatePhone_(payload.phone);
  var email = clean_(payload.email).toLowerCase();
  if (findRow_('users', 'email', email)) throw err_('Klant bestaat al.', 409);
  var password = clean_(payload.password) || token_().slice(0, 14);
  var now = now_();
  var user = {
    user_id: id_('USR'),
    created_at: now,
    updated_at: now,
    name: clean_(payload.name),
    email: email,
    phone: clean_(payload.phone),
    password_hash: hashPassword_(password),
    role: 'customer',
    active: true,
    last_login: ''
  };
  append_('users', user);
  audit_(auth, 'customer_created', 'user', user.user_id, safeUser_(user));
  if (bool_(payload.send_reset)) createPasswordResetForActor_(user.user_id, email, user.name, 'user', 'Je klantaccount is aangemaakt');
  return ok_({ user: safeUser_(user), temporary_password: clean_(payload.password) ? null : password });
}

function updateCustomer(payload) {
  var auth = requireStaff_(payload, 'customers:write');
  validateRequired_(payload, ['user_id']);
  var row = findRow_('users', 'user_id', payload.user_id);
  if (!row) throw err_('Klant niet gevonden.', 404);
  var patch = { updated_at: now_() };
  ['name', 'phone'].forEach(function(k) { if (payload[k] !== undefined) patch[k] = clean_(payload[k]); });
  if (payload.email !== undefined) {
    validateEmail_(payload.email);
    patch.email = clean_(payload.email).toLowerCase();
  }
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  updateByRow_('users', row.row, patch);
  audit_(auth, 'customer_updated', 'user', payload.user_id, patch);
  return ok_(safeUser_(findRow_('users', 'user_id', payload.user_id).record));
}

function deactivateCustomer(payload) {
  var auth = requireStaff_(payload, 'customers:write');
  validateRequired_(payload, ['user_id']);
  var row = findRow_('users', 'user_id', payload.user_id);
  if (!row) throw err_('Klant niet gevonden.', 404);
  updateByRow_('users', row.row, { active: false, updated_at: now_() });
  audit_(auth, 'customer_deactivated', 'user', payload.user_id, {});
  return ok_({ user_id: payload.user_id, active: false });
}

function getProductsAdmin(payload) {
  requireStaff_(payload, 'products:view');
  var imageMap = productImageMap_();
  return ok_(rows_('products').map(function(p) {
    var out = {};
    Object.keys(p).forEach(function(k) { out[k] = p[k]; });
    var productId = p.product_id || p.id;
    out.images = productImages_(productId, p, imageMap);
    out.image_count = out.images.length;
    return out;
  }));
}

function createProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['name', 'sell_price', 'stock']);
  var productId = id_('PROD');
  var now = now_();
  var folder = ensureProductFolder_(productId, clean_(payload.name));
  var discountType = clean_(payload.discount_type || 'none');
  var discountValue = payload.discount_value === undefined || clean_(payload.discount_value) === '' ? 0 : money_(payload.discount_value);
  validateDiscount_(discountType, discountValue);
  var pricing = productPricing_(payload);
  var product = {
    product_id: productId,
    id: productId,
    created_at: now,
    updated_at: now,
    name: clean_(payload.name),
    description: clean_(payload.description),
    price: pricing.price_inc_vat,
    cost_price: pricing.cost_price,
    sell_price: pricing.sell_price,
    margin_percentage: pricing.margin_percentage,
    vat_enabled: pricing.vat_enabled,
    vat_percentage: pricing.vat_percentage,
    price_ex_vat: pricing.price_ex_vat,
    price_inc_vat: pricing.price_inc_vat,
    stock: Math.max(0, Math.floor(num_(payload.stock))),
    active: payload.active === undefined ? true : bool_(payload.active),
    status: clean_(payload.status || 'active'),
    image_url: clean_(payload.image_url),
    sku: clean_(payload.sku),
    category: clean_(payload.category),
    discount_type: discountType,
    discount_value: discountValue,
    drive_folder_id: folder.id,
    drive_folder_url: folder.url
  };
  append_('products', product);
  appendProductImageIfPresent_(productId, payload);
  appendProductImagesIfPresent_(productId, payload);
  audit_(auth, 'product_created', 'product', productId, product);
  return ok_(product);
}

function updateProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  var patch = { updated_at: now_() };
  ['name', 'description', 'image_url', 'sku', 'category'].forEach(function(k) { if (payload[k] !== undefined) patch[k] = clean_(payload[k]); });
  if (payload.price !== undefined || payload.sell_price !== undefined || payload.cost_price !== undefined || payload.vat_enabled !== undefined || payload.vat_percentage !== undefined) {
    var pricing = productPricing_(mergeObjects_(row.record, payload));
    patch.price = pricing.price_inc_vat;
    patch.cost_price = pricing.cost_price;
    patch.sell_price = pricing.sell_price;
    patch.margin_percentage = pricing.margin_percentage;
    patch.vat_enabled = pricing.vat_enabled;
    patch.vat_percentage = pricing.vat_percentage;
    patch.price_ex_vat = pricing.price_ex_vat;
    patch.price_inc_vat = pricing.price_inc_vat;
  }
  if (payload.stock !== undefined) patch.stock = Math.max(0, Math.floor(num_(payload.stock)));
  if (payload.status !== undefined) patch.status = clean_(payload.status);
  if (payload.shipping_class !== undefined) patch.shipping_class = clean_(payload.shipping_class);
  if (payload.discount_type !== undefined) patch.discount_type = clean_(payload.discount_type);
  if (payload.discount_value !== undefined) patch.discount_value = money_(payload.discount_value);
  if (patch.discount_type || patch.discount_value !== undefined) validateDiscount_(patch.discount_type || row.record.discount_type || 'none', patch.discount_value !== undefined ? patch.discount_value : row.record.discount_value || 0);
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  updateByRow_('products', row.row, patch);
  appendProductImageIfPresent_(row.record.product_id || row.record.id, payload);
  appendProductImagesIfPresent_(row.record.product_id || row.record.id, payload);
  var updated = findRowAny_('products', ['product_id', 'id'], payload.product_id).record;
  audit_(auth, 'product_updated', 'product', updated.product_id || updated.id, patch);
  return ok_(updated);
}

function deactivateProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  updateByRow_('products', row.row, { active: false, updated_at: now_() });
  audit_(auth, 'product_deactivated', 'product', payload.product_id, {});
  return ok_({ product_id: payload.product_id, active: false });
}

function archiveProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  updateByRow_('products', row.row, { active: false, status: 'archived', updated_at: now_() });
  audit_(auth, 'product_archived', 'product', payload.product_id, {});
  return ok_({ product_id: payload.product_id, status: 'archived' });
}

function restoreProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  updateByRow_('products', row.row, { active: true, status: 'active', updated_at: now_() });
  audit_(auth, 'product_restored', 'product', payload.product_id, {});
  return ok_({ product_id: payload.product_id, status: 'active' });
}

function duplicateProduct(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  var copy = mergeObjects_(row.record, {});
  copy.product_id = id_('PROD');
  copy.id = copy.product_id;
  copy.name = copy.name + ' kopie';
  copy.created_at = now_();
  copy.updated_at = now_();
  copy.status = 'draft';
  copy.active = false;
  append_('products', copy);
  audit_(auth, 'product_duplicated', 'product', copy.product_id, { source: payload.product_id });
  return ok_(copy);
}

function syncAllProductImages(payload) {
  var auth = requireStaff_(payload, 'products:write');
  var result = syncAllProductImages_();
  audit_(auth, 'all_product_images_synced', 'products', 'all', result);
  return ok_(result);
}

function syncProductImages(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['product_id']);
  var row = findRowAny_('products', ['product_id', 'id'], payload.product_id);
  if (!row) throw err_('Product niet gevonden.', 404);
  var synced = syncProductImages_(row.record);
  audit_(auth, 'product_images_synced', 'product', payload.product_id, { count: synced.length });
  return ok_({ product_id: payload.product_id, synced: synced });
}

function runSystemCheck(payload) {
  var auth = requireStaff_(payload, 'settings:view');
  var result = runSystemCheck_();
  audit_(auth, 'system_check_manual', 'system', 'health', result);
  return ok_(result);
}

function installAutomationTriggers(payload) {
  var auth = requireStaff_(payload, 'settings:write');
  var result = installAutomationTriggers_();
  audit_(auth, 'automation_triggers_installed', 'system', 'triggers', result);
  return ok_(result);
}

function getCoupons(payload) {
  requireStaff_(payload, 'products:view');
  return ok_(rows_('coupons'));
}

function createCoupon(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['code', 'discount_type', 'discount_value']);
  var code = clean_(payload.code).toUpperCase();
  if (findRow_('coupons', 'code', code)) throw err_('Kortingscode bestaat al.', 409);
  var coupon = {
    coupon_id: id_('CPN'),
    created_at: now_(),
    updated_at: now_(),
    code: code,
    discount_type: clean_(payload.discount_type),
    discount_value: money_(payload.discount_value),
    active: payload.active === undefined ? true : bool_(payload.active),
    expires_at: clean_(payload.expires_at),
    usage_limit: Math.max(0, Math.floor(num_(payload.usage_limit))),
    used_count: 0
  };
  validateDiscount_(coupon.discount_type, coupon.discount_value);
  append_('coupons', coupon);
  audit_(auth, 'coupon_created', 'coupon', coupon.coupon_id, coupon);
  return ok_(coupon);
}

function updateCoupon(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['coupon_id']);
  var row = findRow_('coupons', 'coupon_id', payload.coupon_id);
  if (!row) throw err_('Kortingscode niet gevonden.', 404);
  var patch = { updated_at: now_() };
  ['code', 'discount_type', 'expires_at'].forEach(function(k) { if (payload[k] !== undefined) patch[k] = k === 'code' ? clean_(payload[k]).toUpperCase() : clean_(payload[k]); });
  if (payload.discount_value !== undefined) patch.discount_value = money_(payload.discount_value);
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  if (payload.usage_limit !== undefined) patch.usage_limit = Math.max(0, Math.floor(num_(payload.usage_limit)));
  if (patch.discount_type || patch.discount_value !== undefined) validateDiscount_(patch.discount_type || row.record.discount_type, patch.discount_value !== undefined ? patch.discount_value : row.record.discount_value);
  updateByRow_('coupons', row.row, patch);
  audit_(auth, 'coupon_updated', 'coupon', payload.coupon_id, patch);
  return ok_(findRow_('coupons', 'coupon_id', payload.coupon_id).record);
}

function deactivateCoupon(payload) {
  var auth = requireStaff_(payload, 'products:write');
  validateRequired_(payload, ['coupon_id']);
  var row = findRow_('coupons', 'coupon_id', payload.coupon_id);
  if (!row) throw err_('Kortingscode niet gevonden.', 404);
  updateByRow_('coupons', row.row, { active: false, updated_at: now_() });
  audit_(auth, 'coupon_deactivated', 'coupon', payload.coupon_id, {});
  return ok_({ coupon_id: payload.coupon_id, active: false });
}

function getStaff(payload) {
  requireStaff_(payload, 'staff:view');
  return ok_(rows_('staff').map(safeStaff_));
}

function createStaff(payload) {
  var auth = requireStaff_(payload, 'staff:write');
  validateRequired_(payload, ['name', 'email', 'role']);
  validateEmail_(payload.email);
  var role = clean_(payload.role);
  if (!APP.ROLES[role]) throw err_('Onbekende rol.', 400);
  var email = clean_(payload.email).toLowerCase();
  if (findRow_('staff', 'email', email)) throw err_('Medewerker bestaat al.', 409);
  var password = clean_(payload.password) || token_().slice(0, 14);
  var staff = {
    staff_id: id_('STF'),
    created_at: now_(),
    updated_at: now_(),
    name: clean_(payload.name),
    email: email,
    password_hash: hashPassword_(password),
    role: role,
    permissions: permissionsForRole_(role).join(','),
    active: true,
    last_login: ''
  };
  append_('staff', staff);
  audit_(auth, 'staff_created', 'staff', staff.staff_id, safeStaff_(staff));
  createPasswordResetForActor_(staff.staff_id, email, staff.name, 'staff', 'Je medewerkeraccount is aangemaakt');
  return ok_({ staff: safeStaff_(staff), temporary_password: clean_(payload.password) ? null : password });
}

function updateStaff(payload) {
  var auth = requireStaff_(payload, 'staff:write');
  validateRequired_(payload, ['staff_id']);
  var row = findRow_('staff', 'staff_id', payload.staff_id);
  if (!row) throw err_('Medewerker niet gevonden.', 404);
  if (row.record.role === 'owner' && auth.staff.role !== 'owner') throw err_('Alleen owner mag owner-accounts wijzigen.', 403);
  var patch = { updated_at: now_() };
  ['name', 'role'].forEach(function(k) { if (payload[k] !== undefined) patch[k] = clean_(payload[k]); });
  if (payload.role !== undefined) patch.permissions = permissionsForRole_(payload.role).join(',');
  if (payload.active !== undefined) patch.active = bool_(payload.active);
  updateByRow_('staff', row.row, patch);
  audit_(auth, 'staff_updated', 'staff', payload.staff_id, patch);
  return ok_(safeStaff_(findRow_('staff', 'staff_id', payload.staff_id).record));
}

function deactivateStaff(payload) {
  var auth = requireStaff_(payload, 'staff:write');
  validateRequired_(payload, ['staff_id']);
  var row = findRow_('staff', 'staff_id', payload.staff_id);
  if (!row) throw err_('Medewerker niet gevonden.', 404);
  if (row.record.role === 'owner' && auth.staff.role !== 'owner') throw err_('Alleen owner mag owner deactiveren.', 403);
  updateByRow_('staff', row.row, { active: false, updated_at: now_() });
  audit_(auth, 'staff_deactivated', 'staff', payload.staff_id, {});
  return ok_({ staff_id: payload.staff_id, active: false });
}

function sendStaffPasswordReset(payload) {
  requireStaff_(payload, 'staff:write');
  validateRequired_(payload, ['email']);
  return requestPasswordReset({ email: payload.email });
}

function getEmailLog(payload) {
  requireStaff_(payload, 'logs:view');
  return ok_(rows_('email_log').sort(sortCreatedDesc_));
}

function getAuditLog(payload) {
  requireStaff_(payload, 'logs:view');
  return ok_(rows_('audit_log').sort(sortCreatedDesc_));
}

function getSettingsAdmin(payload) {
  requireStaff_(payload, 'settings:view');
  return ok_(getSettingsMap_());
}

function updateSetting(payload) {
  var auth = requireStaff_(payload, 'settings:write');
  validateRequired_(payload, ['key']);
  setSetting_(payload.key, clean_(payload.value));
  audit_(auth, 'setting_updated', 'setting', payload.key, { value: payload.value });
  return ok_({ key: payload.key, value: clean_(payload.value) });
}

function getCompanySettings(payload) {
  requireStaff_(payload, 'settings:view');
  return ok_(getCompanyMap_());
}

function updateCompanySettings(payload) {
  var auth = requireStaff_(payload, 'settings:write');
  if (['owner', 'admin'].indexOf(auth.staff.role) === -1) {
    throw err_('Alleen owner/admin mag bedrijfsgegevens aanpassen.', 403);
  }
  var values = payload.values || payload.company || {};
  Object.keys(values).forEach(function(key) {
    if (['credit_enabled', 'credit_text', 'credit_url', 'credit_label'].indexOf(key) !== -1) return;
    setCompany_(key, clean_(values[key]));
  });
  audit_(auth, 'company_settings_updated', 'bedrijf', 'bedrijf', values);
  return ok_(getCompanyMap_());
}

function updateOrderField_(auth, orderId, patch, action) {
  var row = findRow_('orders', 'order_id', orderId);
  if (!row) throw err_('Order niet gevonden.', 404);
  var before = row.record;
  updateByRow_('orders', row.row, patch);
  var updated = getOrder_(orderId);
  audit_(auth, action, 'order', orderId, patch);
  Object.keys(patch).forEach(function(key) {
    if (key !== 'updated_at') logOrderHistory_(orderId, auth.actor_email || 'staff', action + ':' + key, before[key], patch[key], clean_(patch.notes));
  });
  return ok_(adminOrderDetails_(updated));
}

function ensureDatabase_(force) {
  var cache = CacheService.getScriptCache();
  if (!force && cache.get('db_ready_v2') === '1') return;
  var ss = SpreadsheetApp.getActive();
  Object.keys(APP.SHEETS).forEach(function(name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    ensureHeaders_(sheet, APP.SHEETS[name]);
  });
  var settings = getSettingsMap_();
  Object.keys(APP.DEFAULT_SETTINGS).forEach(function(key) {
    if (settings[key] === undefined) setSetting_(key, APP.DEFAULT_SETTINGS[key]);
  });
  var company = getCompanyMap_();
  Object.keys(APP.DEFAULT_COMPANY).forEach(function(key) {
    if (company[key] === undefined) setCompany_(key, APP.DEFAULT_COMPANY[key]);
  });
  cache.put('db_ready_v2', '1', 600);
}

function ensureHeaders_(sheet, required) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, required.length).setValues([required]);
  }
  var headers = getHeaders_(sheet);
  var changed = false;
  required.forEach(function(h) {
    if (headers.indexOf(h) === -1) {
      headers.push(h);
      changed = true;
    }
  });
  if (changed) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#111827').setFontColor('#ffffff');
}

function ensureInitialOwner_() {
  var settings = getSettingsMap_();
  ensureOwnerAccount_(APP.DEFAULT_ADMIN.email, APP.DEFAULT_ADMIN.password, APP.DEFAULT_ADMIN.name);
  var email = clean_(settings.first_owner_email || settings.admin_email).toLowerCase();
  if (email && email !== APP.DEFAULT_ADMIN.email) {
    ensureOwnerAccount_(email, clean_(settings.first_owner_password) || APP.DEFAULT_ADMIN.password, 'Owner');
  }
  setSetting_('first_owner_email', APP.DEFAULT_ADMIN.email);
  setSetting_('first_owner_temporary_password', APP.DEFAULT_ADMIN.password);
}

function ensureOwnerAccount_(email, password, name) {
  email = clean_(email).toLowerCase();
  if (!email || findRow_('staff', 'email', email)) return;
  append_('staff', {
    staff_id: id_('OWN'),
    created_at: now_(),
    updated_at: now_(),
    name: clean_(name) || 'Owner',
    email: email,
    password_hash: hashPassword_(password),
    role: 'owner',
    permissions: '*',
    active: true,
    last_login: ''
  });
}

function seedProductsIfEmpty_() {
  return;
}

function cleanupDemoProducts_() {
  deleteRowsWhere_('products', function(row) {
    return clean_(row.product_id) === 'PROD-DEMO-1' || clean_(row.sku) === 'DEMO-1' || clean_(row.name).toLowerCase() === 'demo product';
  });
  deleteRowsWhere_('product_images', function(row) {
    return clean_(row.product_id) === 'PROD-DEMO-1';
  });
  clearProductCaches_();
}

function deleteRowsWhere_(sheetName, predicate) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return 0;
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  var deleted = 0;
  for (var i = values.length - 1; i >= 0; i--) {
    var row = {};
    headers.forEach(function(h, j) { row[h] = values[i][j]; });
    if (predicate(row)) {
      sheet.deleteRow(i + 2);
      deleted += 1;
    }
  }
  delete ROW_CACHE_[sheetName];
  return deleted;
}

function ensureProductFolder_(productId, productName) {
  var settings = getSettingsMap_();
  var rootId = clean_(settings.drive_products_root_folder_id);
  var root;
  try {
    root = rootId ? DriveApp.getFolderById(rootId) : null;
  } catch (e) {
    root = null;
  }
  if (!root) {
    var name = 'Producten - ' + clean_(settings.shop_name || settings.store_name || 'Webshop') + ' - ' + shortCode_();
    root = DriveApp.createFolder(name);
    setSetting_('drive_products_root_folder_id', root.getId());
    setSetting_('drive_products_root_folder_name', name);
  }
  try {
    root.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingError) {
    console.error(sharingError);
  }
  var folderName = clean_(productName) + ' - ' + productId;
  var folder = root.createFolder(folderName);
  try {
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (folderSharingError) {
    console.error(folderSharingError);
  }
  return { id: folder.getId(), url: folder.getUrl() };
}

function output_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) {
  return { success: true, data: jsonSafe_(data === undefined ? {} : data), error: null };
}

function fail_(message, code) {
  return { success: false, data: null, error: { message: message, code: code || 500 } };
}

function err_(message, code) {
  var e = new Error(message);
  e.code = code || 500;
  return e;
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  try {
    if (raw.charAt(0) === '{' || raw.charAt(0) === '[') return JSON.parse(raw);
    var parsed = {};
    raw.split('&').forEach(function(part) {
      var pieces = part.split('=');
      if (!pieces[0]) return;
      parsed[decodeURIComponent(pieces[0])] = decodeURIComponent((pieces.slice(1).join('=') || '').replace(/\+/g, ' '));
    });
    if (parsed.payload) return JSON.parse(parsed.payload);
    return parsed;
  } catch (error) {
    throw err_('Ongeldige request body.', 400);
  }
}

function param_(e, key) {
  return e && e.parameter ? e.parameter[key] : '';
}

function bearer_(payload) {
  return clean_(payload && (payload.token || payload.auth_token || payload.session_token));
}

function requireUser_(payload) {
  var session = requireSession_(payload, 'user');
  var userRow = findRow_('users', 'user_id', session.actor_id);
  if (!userRow || !bool_(userRow.record.active)) throw err_('Log opnieuw in.', 401);
  return { session: session, user: userRow.record };
}

function requireStaff_(payload, permission) {
  var session = requireSession_(payload, 'staff');
  var staffRow = findRow_('staff', 'staff_id', session.actor_id);
  if (!staffRow || !bool_(staffRow.record.active)) throw err_('Geen toegang.', 401);
  if (!hasPermission_(staffRow.record, permission)) throw err_('Je rol heeft geen rechten voor deze actie.', 403);
  return { actor_type: 'staff', actor_id: staffRow.record.staff_id, actor_email: staffRow.record.email, session: session, staff: staffRow.record };
}

function requireSession_(payload, type) {
  var token = bearer_(payload);
  if (!token) throw err_('Login vereist.', 401);
  var row = findRow_('sessions', 'token', token);
  if (!row || !bool_(row.record.active) || clean_(row.record.actor_type) !== type || new Date(row.record.expires_at).getTime() < Date.now()) throw err_('Sessie is verlopen.', 401);
  updateByRow_('sessions', row.row, { last_seen: now_() });
  return row.record;
}

function createSession_(actorType, actorId, email, role) {
  var session = {
    token_id: id_('TOK'),
    created_at: now_(),
    expires_at: dateAddHours_(new Date(), APP.SESSION_HOURS),
    actor_type: actorType,
    actor_id: actorId,
    email: email,
    role: role,
    token: token_(),
    active: true,
    last_seen: now_()
  };
  append_('sessions', session);
  return session;
}

function hasPermission_(staff, permission) {
  if (!permission) return true;
  if (staff.role === 'owner') return true;
  var perms = permissionsForRole_(staff.role, staff.permissions);
  return perms.indexOf('*') !== -1 || perms.indexOf(permission) !== -1;
}

function permissionsForRole_(role, explicit) {
  if (explicit && clean_(explicit) !== '*') return clean_(explicit).split(',').map(clean_).filter(Boolean);
  return APP.ROLES[clean_(role)] || [];
}

function rows_(sheetName) {
  if (ROW_CACHE_[sheetName]) return ROW_CACHE_[sheetName].map(function(row) { return Object.assign({}, row); });
  var sheet = sheet_(sheetName);
  var last = sheet.getLastRow();
  var headers = getHeaders_(sheet);
  if (last < 2) return [];
  var data = sheet.getRange(2, 1, last - 1, headers.length).getValues().map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
  ROW_CACHE_[sheetName] = data;
  return data.map(function(row) { return Object.assign({}, row); });
}

function append_(sheetName, object) {
  delete ROW_CACHE_[sheetName];
  if (sheetName === 'products' || sheetName === 'product_images') clearProductCaches_();
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  sheet.appendRow(headers.map(function(h) { return cell_(object[h]); }));
}

function updateByRow_(sheetName, rowNumber, patch) {
  delete ROW_CACHE_[sheetName];
  if (sheetName === 'products' || sheetName === 'product_images') clearProductCaches_();
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  Object.keys(patch).forEach(function(key) {
    var idx = headers.indexOf(key);
    if (idx !== -1) sheet.getRange(rowNumber, idx + 1).setValue(cell_(patch[key]));
  });
}

function clearProductCaches_() {
  var cache = CacheService.getScriptCache();
  try {
    cache.remove('public_products_v2');
    cache.remove('public_products_v3');
    cache.remove('initial_products_v1_2');
    cache.remove('initial_products_v1_3');
    cache.remove('initial_products_v1_4');
    for (var offset = 0; offset <= 240; offset += 12) cache.remove('products_page_v1_' + offset + '_12');
  } catch (cacheError) {}
}

function findRow_(sheetName, field, value) {
  var sheet = sheet_(sheetName);
  var headers = getHeaders_(sheet);
  var idx = headers.indexOf(field);
  if (idx === -1 || sheet.getLastRow() < 2) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (clean_(values[i][idx]).toLowerCase() === clean_(value).toLowerCase()) {
      var obj = {};
      headers.forEach(function(h, j) { obj[h] = values[i][j]; });
      return { row: i + 2, record: obj };
    }
  }
  return null;
}

function findRowAny_(sheetName, fields, value) {
  for (var i = 0; i < fields.length; i++) {
    var found = findRow_(sheetName, fields[i], value);
    if (found) return found;
  }
  return null;
}

function getOrder_(orderId) {
  var row = findRow_('orders', 'order_id', orderId);
  if (!row) throw err_('Order niet gevonden.', 404);
  return row.record;
}

function getOrderItems_(orderId) {
  return rows_('order_items').filter(function(i) { return clean_(i.order_id) === clean_(orderId); });
}

function getReturnsForOrder_(orderId) {
  return rows_('returns').filter(function(r) { return clean_(r.order_id) === clean_(orderId); });
}

function sheet_(name) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw err_('Sheet ontbreekt: ' + name, 500);
  return sheet;
}

function getHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(clean_);
}

function getSettingsMap_() {
  var map = {};
  rows_('settings').forEach(function(r) { if (r.key) map[clean_(r.key)] = clean_(r.value); });
  return map;
}

function getCompanyMap_() {
  var map = {};
  rows_('bedrijf').forEach(function(r) { if (r.key) map[clean_(r.key)] = clean_(r.value); });
  map.credit_enabled = 'true';
  map.credit_text = APP.DEFAULT_COMPANY.credit_text;
  map.credit_url = APP.DEFAULT_COMPANY.credit_url;
  map.credit_label = APP.DEFAULT_COMPANY.credit_label;
  return map;
}

function setSetting_(key, value) {
  var row = findRow_('settings', 'key', key);
  if (row) updateByRow_('settings', row.row, { value: value });
  else append_('settings', { key: key, value: value });
}

function setCompany_(key, value) {
  var row = findRow_('bedrijf', 'key', key);
  if (row) updateByRow_('bedrijf', row.row, { value: value });
  else append_('bedrijf', { key: key, value: value });
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw err_('Het is druk. Probeer het opnieuw.', 429);
  try { return fn(); } finally { lock.releaseLock(); }
}

function hashPassword_(password) {
  var salt = token_().slice(0, 24);
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + String(password), Utilities.Charset.UTF_8);
  return salt + '$' + Utilities.base64Encode(hash);
}

function verifyPassword_(password, stored) {
  var parts = clean_(stored).split('$');
  if (parts.length !== 2) return false;
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, parts[0] + String(password), Utilities.Charset.UTF_8);
  return Utilities.base64Encode(hash) === parts[1];
}

function token_() {
  return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
}

function id_(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyyMMddHHmmss') + '-' + shortCode_();
}

function shortCode_() {
  return token_().slice(0, 6).toUpperCase();
}

function now_() {
  return new Date();
}

function dateAddHours_(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function dateAddMinutes_(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function clean_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function num_(value) {
  var n = Number(clean_(value).replace(',', '.'));
  return isFinite(n) ? n : 0;
}

function money_(value) {
  return Math.round(num_(value) * 100) / 100;
}

function bool_(value) {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'ja', 'y'].indexOf(clean_(value).toLowerCase()) !== -1;
}

function cell_(value) {
  if (value instanceof Date || typeof value === 'number' || typeof value === 'boolean') return value;
  return clean_(value);
}

function validateRequired_(payload, fields) {
  fields.forEach(function(field) {
    if (payload[field] === undefined || payload[field] === null || clean_(payload[field]) === '' || (Array.isArray(payload[field]) && payload[field].length === 0)) throw err_('Verplicht veld ontbreekt: ' + field, 400);
  });
}

function validateEmail_(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean_(email))) throw err_('Vul een geldig e-mailadres in.', 400);
}

function validatePhone_(phone) {
  if (!/^\+?[0-9\s().-]{7,20}$/.test(clean_(phone))) throw err_('Vul een geldig telefoonnummer in.', 400);
}

function validatePassword_(password) {
  if (String(password || '').length < 8) throw err_('Wachtwoord moet minimaal 8 tekens bevatten.', 400);
}

function publicSettings_(settings) {
  return {
    shop_name: settings.website_name || settings.brand_name || settings.company_name || 'Webshop',
    store_name: settings.website_name || settings.brand_name || settings.company_name || 'Webshop',
    store_status: settings.store_status || 'open',
    shipping_cost: money_(settings.shipping_cost),
    free_shipping_above: money_(settings.free_shipping_above)
  };
}

function isPublicProduct_(p) {
  var status = clean_(p.status || 'active').toLowerCase();
  return bool_(p.active) && status !== 'archived' && status !== 'draft';
}

function publicProduct_(p, imageMap) {
  var price = money_(p.price || p.price_inc_vat || p.sell_price);
  var discount = discountAmount_(price, p.discount_type, p.discount_value);
  var productId = p.product_id || p.id;
  var images = productImages_(productId, p, imageMap);
  return { product_id: productId, id: productId, name: p.name, description: p.description, price: money_(price - discount), original_price: price, stock: num_(p.stock), active: bool_(p.active), status: clean_(p.status || 'active'), image_url: images.length ? images[0].url : '', images: images, sku: p.sku, category: p.category, discount_type: p.discount_type || 'none', discount_value: num_(p.discount_value), drive_folder_id: p.drive_folder_id, drive_folder_url: p.drive_folder_url };
}

function publicOrderSummary_(o) {
  return { order_id: o.order_id, created_at: o.created_at, updated_at: o.updated_at, status: o.status, payment_status: o.payment_status, fulfillment_status: o.fulfillment_status, subtotal: money_(o.subtotal), shipping_cost: money_(o.shipping_cost), total_price: money_(o.total_price), delivery_type: o.delivery_type, track_trace: o.track_trace };
}

function publicOrderDetails_(o) {
  var out = publicOrderSummary_(o);
  out.items = getOrderItems_(o.order_id);
  out.returns = getReturnsForOrder_(o.order_id);
  return out;
}

function publicReview_(r) {
  return {
    review_id: r.review_id,
    created_at: r.created_at,
    target_type: r.target_type,
    product_id: r.product_id,
    product_name: r.product_name,
    name: r.name,
    rating: Math.floor(num_(r.rating)),
    title: r.title,
    message: r.message
  };
}

function averageRating_(reviews) {
  if (!reviews || !reviews.length) return 0;
  return money_(reviews.reduce(function(sum, r) { return sum + num_(r.rating); }, 0) / reviews.length);
}

function adminOrderSummary_(o) {
  var out = {};
  Object.keys(o).forEach(function(k) { out[k] = o[k]; });
  out.items_count = getOrderItems_(o.order_id).length;
  return out;
}

function adminOrderDetails_(o) {
  var out = adminOrderSummary_(o);
  out.items = getOrderItems_(o.order_id);
  out.returns = getReturnsForOrder_(o.order_id);
  out.history = rows_('order_history').filter(function(h) { return clean_(h.order_id) === clean_(o.order_id); }).sort(sortCreatedDesc_);
  out.email_history = rows_('email_log').filter(function(e) { return clean_(e.order_id || e.target_id) === clean_(o.order_id); }).sort(sortCreatedDesc_);
  out.mail_warnings = buildMailWarnings_(out.email_history);
  return out;
}

function safeUser_(u) {
  return { user_id: u.user_id, created_at: u.created_at, updated_at: u.updated_at, name: u.name, email: u.email, phone: u.phone, role: u.role, active: bool_(u.active), last_login: u.last_login };
}

function safeStaff_(s) {
  return { staff_id: s.staff_id, created_at: s.created_at, updated_at: s.updated_at, name: s.name, email: s.email, role: s.role, permissions: s.permissions, active: bool_(s.active), last_login: s.last_login };
}

function shippingFor_(subtotal, settings) {
  var freeAbove = money_(settings.free_shipping_above);
  if (freeAbove > 0 && subtotal >= freeAbove) return 0;
  return money_(settings.shipping_cost);
}

function validateDiscount_(type, value) {
  type = clean_(type);
  if (['none', 'fixed', 'percent'].indexOf(type) === -1) throw err_('Ongeldig kortingstype.', 400);
  if (num_(value) < 0) throw err_('Korting mag niet negatief zijn.', 400);
  if (type === 'percent' && num_(value) > 100) throw err_('Percentagekorting mag maximaal 100 zijn.', 400);
}

function discountAmount_(base, type, value) {
  type = clean_(type || 'none');
  value = num_(value);
  if (type === 'percent') return money_(Math.min(base, base * value / 100));
  if (type === 'fixed') return money_(Math.min(base, value));
  return 0;
}

function getValidCoupon_(code) {
  code = clean_(code).toUpperCase();
  if (!code) return null;
  var row = findRow_('coupons', 'code', code);
  if (!row || !bool_(row.record.active)) throw err_('Kortingscode is ongeldig.', 400);
  if (row.record.expires_at && new Date(row.record.expires_at).getTime() < Date.now()) throw err_('Kortingscode is verlopen.', 400);
  if (num_(row.record.usage_limit) > 0 && num_(row.record.used_count) >= num_(row.record.usage_limit)) throw err_('Kortingscode is niet meer beschikbaar.', 400);
  validateDiscount_(row.record.discount_type, row.record.discount_value);
  return row.record;
}

function incrementCouponUse_(code) {
  var row = findRow_('coupons', 'code', code);
  if (row) updateByRow_('coupons', row.row, { used_count: num_(row.record.used_count) + 1, updated_at: now_() });
}

function mapBy_(array, key) {
  var map = {};
  array.forEach(function(item) { if (item[key] !== undefined && clean_(item[key]) !== '') map[clean_(item[key])] = item; });
  return map;
}

function ymd_(value) {
  return Utilities.formatDate(new Date(value), APP.TIMEZONE, 'yyyy-MM-dd');
}

function startOfWeek_(date) {
  var d = new Date(date);
  var day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function sumTotal_(sum, order) {
  return sum + num_(order.total_price);
}

function sortCreatedDesc_(a, b) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function sortRequestedDesc_(a, b) {
  return new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime();
}

function audit_(auth, action, targetType, targetId, details) {
  append_('audit_log', {
    log_id: id_('LOG'),
    created_at: now_(),
    actor_type: auth.actor_type || '',
    actor_id: auth.actor_id || '',
    actor_email: auth.actor_email || '',
    action: action,
    target_type: targetType,
    target_id: targetId,
    details: JSON.stringify(details || {})
  });
}

function sendOrderMail_(order, type) {
  var rendered = renderOrderEmailTemplate_(order, type);
  sendEmail_(order.email, rendered.subject, rendered.html, type, 'order', order.order_id);
  logOrderHistory_(order.order_id, 'system', 'mail_sent', '', type, rendered.subject);
}

function passwordResetEmail_(name, token) {
  var settings = getSettingsMap_();
  var base = clean_(settings.admin_frontend_url || settings.customer_frontend_url || ScriptApp.getService().getUrl());
  var joiner = base.indexOf('?') === -1 ? '?' : '&';
  var url = base + joiner + 'reset_token=' + encodeURIComponent(token);
  return simpleMail_('Wachtwoord resetten', 'Hallo ' + clean_(name) + ', gebruik deze link binnen ' + APP.RESET_MINUTES + ' minuten: ' + url);
}

function createPasswordResetForActor_(actorId, email, name, actorType, subject) {
  var token = token_();
  append_('password_reset_tokens', {
    token_id: id_('RST'),
    user_id: actorId,
    email: email,
    token: token,
    created_at: now_(),
    expires_at: dateAddMinutes_(new Date(), APP.RESET_MINUTES),
    used: false,
    used_at: ''
  });
  sendEmail_(email, subject || 'Wachtwoord resetten', passwordResetEmail_(name || email, token), 'password_reset', actorType, actorId);
  return token;
}

function createPasswordCodeForActor_(actorId, email, name, actorType) {
  var code = token_().slice(0, 10).toUpperCase();
  append_('password_reset_tokens', {
    token_id: id_('RST'),
    user_id: actorId,
    email: email,
    token: code,
    created_at: now_(),
    expires_at: dateAddMinutes_(new Date(), APP.RESET_MINUTES),
    used: false,
    used_at: ''
  });
  var html = simpleMail_('Herstelcode voor adminlogin', 'Hallo ' + clean_(name) + ', gebruik deze tijdelijke code binnen ' + APP.RESET_MINUTES + ' minuten als wachtwoord: ' + code + '. Wijzig daarna je wachtwoord bij Instellingen.');
  sendEmail_(email, 'Herstelcode voor adminlogin', html, 'admin_password_code', actorType, actorId);
  return code;
}

function verifyStaffResetCode_(email, code) {
  var rows = rows_('password_reset_tokens');
  for (var i = rows.length - 1; i >= 0; i--) {
    var r = rows[i];
    if (clean_(r.email).toLowerCase() !== clean_(email).toLowerCase()) continue;
    if (clean_(r.token) !== clean_(code)) continue;
    if (bool_(r.used) || new Date(r.expires_at).getTime() < Date.now()) return false;
    var row = findRow_('password_reset_tokens', 'token', r.token);
    if (row) updateByRow_('password_reset_tokens', row.row, { used: true, used_at: now_() });
    return true;
  }
  return false;
}

function simpleMail_(title, text) {
  return renderBaseMail_({ title: title, intro: text, rows: [] });
}

function sendEmail_(to, subject, html, type, targetType, targetId) {
  var id = id_('EML');
  var company = getCompanyMap_();
  try {
    MailApp.sendEmail({ to: to, subject: subject, htmlBody: html, name: clean_(company.company_name || company.website_name || 'Webshop') });
    append_('email_log', { email_id: id, created_at: now_(), order_id: targetType === 'order' ? targetId : '', user_id: targetType === 'user' ? targetId : '', recipient: to, to: to, subject: subject, template: type, type: type, target_type: targetType, target_id: targetId, status: 'sent', resent: false, resent_count: 0, error: '' });
  } catch (error) {
    append_('email_log', { email_id: id, created_at: now_(), order_id: targetType === 'order' ? targetId : '', user_id: targetType === 'user' ? targetId : '', recipient: to, to: to, subject: subject, template: type, type: type, target_type: targetType, target_id: targetId, status: 'failed', resent: false, resent_count: 0, error: error.message });
  }
}

function renderOrderEmailTemplate_(order, type) {
  var company = getCompanyMap_();
  var items = getOrderItems_(order.order_id);
  var templates = {
    order_created: {
      subject: 'We hebben je bestelling ontvangen - {{order_id}}',
      title: 'Bedankt voor je bestelling',
      intro: 'Hallo {{customer_name}}, we hebben je bestelling ontvangen en houden je op de hoogte van de betaling en levering.'
    },
    payment_link_sent: {
      subject: 'Betaallink voor bestelling {{order_id}}',
      title: 'Je betaallink staat klaar',
      intro: 'Hallo {{customer_name}}, gebruik de betaallink hieronder om je bestelling veilig af te ronden.'
    },
    payment_payment_link_sent: {
      subject: 'Betaallink voor bestelling {{order_id}}',
      title: 'Je betaallink staat klaar',
      intro: 'Hallo {{customer_name}}, gebruik de betaallink hieronder om je bestelling veilig af te ronden.'
    },
    payment_paid: {
      subject: 'Betaling ontvangen voor {{order_id}}',
      title: 'Betaling ontvangen',
      intro: 'Hallo {{customer_name}}, bedankt. We hebben je betaling ontvangen en verwerken je bestelling verder.'
    },
    payment_refunded: {
      subject: 'Terugbetaling verwerkt voor {{order_id}}',
      title: 'Terugbetaling verwerkt',
      intro: 'Hallo {{customer_name}}, de terugbetaling voor je bestelling is verwerkt.'
    },
    tracking_sent: {
      subject: 'Track & trace voor bestelling {{order_id}}',
      title: 'Je bestelling is onderweg',
      intro: 'Hallo {{customer_name}}, je track & trace staat klaar. Je kunt je bestelling volgen via de link hieronder.'
    },
    fulfillment_shipped: {
      subject: 'Track & trace voor bestelling {{order_id}}',
      title: 'Je bestelling is onderweg',
      intro: 'Hallo {{customer_name}}, je bestelling is verzonden. Je kunt je bestelling volgen via de track & trace link.'
    },
    fulfillment_delivered: {
      subject: 'Bestelling {{order_id}} is geleverd',
      title: 'Bestelling geleverd',
      intro: 'Hallo {{customer_name}}, volgens onze gegevens is je bestelling geleverd.'
    },
    fulfillment_ready_for_pickup: {
      subject: 'Bestelling {{order_id}} is klaar om op te halen',
      title: 'Klaar om op te halen',
      intro: 'Hallo {{customer_name}}, je bestelling staat klaar om opgehaald te worden.'
    },
    fulfillment_picked_up: {
      subject: 'Bestelling {{order_id}} is opgehaald',
      title: 'Bestelling opgehaald',
      intro: 'Hallo {{customer_name}}, je bestelling is opgehaald. Bedankt voor je bestelling.'
    },
    order_update: {
      subject: 'Update over bestelling {{order_id}}',
      title: 'Orderupdate',
      intro: 'Hallo {{customer_name}}, hieronder vind je de laatste status van je bestelling.'
    }
  };
  var tpl = templates[type] || templates.order_update;
  var vars = mailVariables_(order, company, items);
  return {
    subject: replaceVars_(tpl.subject, vars),
    html: renderBaseMail_({
      company: company,
      title: replaceVars_(tpl.title, vars),
      intro: replaceVars_(tpl.intro, vars),
      rows: [
        ['Ordernummer', vars.order_id],
        ['Datum', vars.created_at],
        ['Betaalstatus', vars.payment_status],
        ['Leveringsstatus', vars.fulfillment_status],
        ['Subtotaal', vars.subtotal],
        ['Korting', vars.discount_total],
        ['Verzendkosten', vars.shipping_cost],
        ['BTW', vars.vat_amount],
        ['Totaal', vars.total_price],
        ['Betaallink', vars.payment_link],
        ['Track & trace', vars.track_trace]
      ],
      items: items
    })
  };
}

function mailVariables_(order, company, items) {
  var address = [company.address_street, company.address_house_number, company.address_postal_code, company.address_city, company.address_country].filter(function(v) { return clean_(v); }).join(' ');
  return {
    website_name: clean_(company.website_name || company.brand_name || company.company_name || 'Webshop'),
    company_name: clean_(company.company_name || company.website_name || 'Webshop'),
    company_email: clean_(company.email_1 || company.email_2 || company.email_3),
    company_phone: clean_(company.phone_1 || company.phone_2 || company.phone_3),
    company_address: address,
    kvk_number: clean_(company.kvk_number),
    btw_number: clean_(company.btw_number),
    order_id: clean_(order.order_id),
    customer_name: clean_(order.customer_name),
    customer_email: clean_(order.email),
    customer_phone: clean_(order.phone),
    created_at: clean_(order.created_at),
    status: clean_(order.status),
    payment_status: clean_(order.payment_status),
    fulfillment_status: clean_(order.fulfillment_status),
    subtotal: 'EUR ' + money_(order.subtotal).toFixed(2),
    discount_total: 'EUR ' + money_(order.discount_total).toFixed(2),
    shipping_cost: 'EUR ' + money_(order.shipping_cost).toFixed(2),
    vat_amount: 'EUR ' + money_(order.vat_amount).toFixed(2),
    total_price: 'EUR ' + money_(order.total_price).toFixed(2),
    payment_link: clean_(order.payment_link),
    track_trace: clean_(order.track_trace),
    items_count: items.length
  };
}

function replaceVars_(text, vars) {
  return clean_(text).replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, function(_, key) { return vars[key] === undefined ? '' : vars[key]; });
}

function renderBaseMail_(options) {
  var company = options.company || getCompanyMap_();
  var name = clean_(company.company_name || company.website_name || 'Webshop');
  var address = [company.address_street, company.address_house_number, company.address_postal_code, company.address_city, company.address_country].filter(function(v) { return clean_(v); }).join(' ');
  var rows = (options.rows || []).filter(function(r) { return clean_(r[1]); }).map(function(r) {
    var value = /^https?:\/\//i.test(clean_(r[1])) ? '<a href="' + esc_(r[1]) + '">' + esc_(r[1]) + '</a>' : esc_(r[1]);
    return '<tr><td style="padding:8px 0;color:#667085">' + esc_(r[0]) + '</td><td style="padding:8px 0;text-align:right;font-weight:700">' + value + '</td></tr>';
  }).join('');
  var items = (options.items || []).map(function(i) {
    return '<tr><td style="padding:8px 0">' + esc_(i.product_name) + ' x ' + esc_(i.quantity) + '</td><td style="padding:8px 0;text-align:right">EUR ' + money_(i.line_total || num_(i.price) * num_(i.quantity)).toFixed(2) + '</td></tr>';
  }).join('');
  return '<div style="font-family:Arial,sans-serif;background:#f6f7f4;padding:24px;color:#18201d">' +
    '<div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dfe5df;border-radius:12px;overflow:hidden">' +
    '<div style="padding:22px 24px;background:#176b5b;color:#ffffff"><div style="font-size:13px;opacity:.85">' + esc_(name) + '</div><h1 style="margin:8px 0 0;font-size:24px">' + esc_(options.title) + '</h1></div>' +
    '<div style="padding:24px"><p style="font-size:15px;line-height:1.6;margin-top:0">' + esc_(options.intro) + '</p>' +
    (rows ? '<table style="width:100%;border-collapse:collapse;border-top:1px solid #eaecf0;border-bottom:1px solid #eaecf0;margin:18px 0">' + rows + '</table>' : '') +
    (items ? '<h2 style="font-size:16px;margin:22px 0 8px">Producten</h2><table style="width:100%;border-collapse:collapse">' + items + '</table>' : '') +
    '<p style="margin-top:24px;color:#667085;font-size:13px;line-height:1.5">' + esc_(name) + (address ? '<br>' + esc_(address) : '') + (company.email_1 ? '<br>' + esc_(company.email_1) : '') + (company.phone_1 ? '<br>' + esc_(company.phone_1) : '') + (company.kvk_number ? '<br>KvK: ' + esc_(company.kvk_number) : '') + (company.btw_number ? '<br>BTW: ' + esc_(company.btw_number) : '') + '</p>' +
    '<p style="margin-top:18px;color:#667085;font-size:12px">Powered and made by Van Appiah - <a href="https://vanappiah.com/">VA</a></p>' +
    '</div></div></div>';
}

function mergeObjects_(base, patch) {
  var out = {};
  Object.keys(base || {}).forEach(function(k) { out[k] = base[k]; });
  Object.keys(patch || {}).forEach(function(k) { out[k] = patch[k]; });
  return out;
}

function productPricing_(payload) {
  var vatEnabled = payload.vat_enabled === undefined || clean_(payload.vat_enabled) === '' ? true : bool_(payload.vat_enabled);
  var vatRate = num_(payload.vat_percentage || getCompanyMap_().vat_percentage || 21);
  var sell = money_(payload.sell_price !== undefined && clean_(payload.sell_price) !== '' ? payload.sell_price : payload.price);
  var ex = vatEnabled ? money_(sell / (1 + vatRate / 100)) : sell;
  var cost = money_(payload.cost_price);
  return { cost_price: cost, sell_price: sell, margin_percentage: sell > 0 ? money_(((sell - cost) / sell) * 100) : 0, vat_enabled: vatEnabled, vat_percentage: vatRate, price_ex_vat: ex, price_inc_vat: sell };
}

function extractDriveId_(value) {
  value = clean_(value);
  var match = value.match(/\/d\/([a-zA-Z0-9_-]+)/) || value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return /^[a-zA-Z0-9_-]{20,}$/.test(value) ? value : '';
}

function convertDriveUrlToDirectImage_(value) {
  var id = extractDriveId_(value);
  return id ? convertDriveUrlToThumbnail_(id, 1000) : clean_(value);
}

function convertDriveUrlToThumbnail_(value, size) {
  var id = extractDriveId_(value);
  return id ? 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + Math.floor(num_(size || 700)) : clean_(value);
}

function makeDriveFilePublic_(fileId) {
  fileId = clean_(fileId);
  if (!fileId) return false;
  try {
    DriveApp.getFileById(fileId).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function makeDriveFolderPublic_(folderId) {
  folderId = clean_(folderId);
  if (!folderId) return null;
  try {
    var folder = DriveApp.getFolderById(folderId);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return folder;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function syncProductImages_(product) {
  var productId = clean_(product.product_id || product.id);
  var folderId = clean_(product.drive_folder_id);
  if (!productId || !folderId) return [];
  var folder = makeDriveFolderPublic_(folderId);
  if (!folder) throw err_('Product heeft geen bereikbare Drive-map: ' + productId, 400);
  var existing = {};
  rows_('product_images').forEach(function(img) {
    if (clean_(img.product_id) === productId && clean_(img.drive_file_id)) existing[clean_(img.drive_file_id)] = true;
  });
  var files = folder.getFiles();
  var sort = 1;
  var synced = [];
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType().indexOf('image/') !== 0) continue;
    var fileId = file.getId();
    makeDriveFilePublic_(fileId);
    var url = convertDriveUrlToThumbnail_(fileId, 1000);
    if (!existing[fileId]) {
      append_('product_images', {
        image_id: id_('IMG'),
        product_id: productId,
        drive_file_id: fileId,
        image_url: url,
        sort_order: sort,
        created_at: now_()
      });
      existing[fileId] = true;
    }
    synced.push({ id: fileId, name: file.getName(), url: url });
    sort += 1;
  }
  if (synced.length && !clean_(product.image_url)) {
    var row = findRowAny_('products', ['product_id', 'id'], productId);
    if (row) updateByRow_('products', row.row, { image_url: synced[0].url, updated_at: now_() });
  }
  return synced;
}

function syncAllProductImages_() {
  ensureDatabase_();
  var result = { products_checked: 0, images_synced: 0, errors: [] };
  rows_('products').forEach(function(product) {
    result.products_checked += 1;
    try {
      var synced = syncProductImages_(product);
      result.images_synced += synced.length;
    } catch (error) {
      result.errors.push({ product_id: product.product_id || product.id, message: error.message });
    }
  });
  clearProductCaches_();
  return result;
}

function autoSyncDriveImages() {
  syncAllProductImages_();
}

function runSystemCheck_() {
  ensureDatabase_();
  var issues = [];
  var products = rows_('products');
  var publicProducts = products.filter(isPublicProduct_);
  var images = productImageMap_();
  if (!sheet_('products')) issues.push('Sheet products is niet bereikbaar.');
  try {
    var settings = getSettingsMap_();
    if (settings.drive_products_root_folder_id && !makeDriveFolderPublic_(settings.drive_products_root_folder_id)) {
      issues.push('Drive hoofdmap is niet bereikbaar of kan niet publiek worden gezet.');
    }
  } catch (driveRootError) {
    issues.push('Drive hoofdmap fout: ' + driveRootError.message);
  }
  products.forEach(function(product) {
    var productId = clean_(product.product_id || product.id);
    var status = clean_(product.status || 'active').toLowerCase();
    if (status === 'archived' && isPublicProduct_(product)) issues.push('Gearchiveerd product staat nog publiek: ' + productId);
    var list = productImages_(productId, product, images);
    if (isPublicProduct_(product) && list.length === 0) issues.push('Publiek product zonder afbeelding: ' + productId + ' - ' + clean_(product.name));
    list.forEach(function(img) {
      if (img.drive_file_id && !makeDriveFilePublic_(img.drive_file_id)) issues.push('Drive afbeelding niet publiek/bereikbaar: ' + productId + ' - ' + img.drive_file_id);
      if (!/^https?:\/\//i.test(clean_(img.url))) issues.push('Ongeldige afbeelding URL: ' + productId + ' - ' + clean_(img.url));
    });
  });
  var result = { ok: issues.length === 0, checked_at: now_(), products: products.length, public_products: publicProducts.length, issues: issues };
  if (issues.length) notifySystemIssues_(issues, result);
  return result;
}

function systemHealthCheck() {
  runSystemCheck_();
}

function notifySystemIssues_(issues, result) {
  var settings = getSettingsMap_();
  var company = getCompanyMap_();
  var to = clean_(settings.admin_email || company.email_1 || APP.DEFAULT_SETTINGS.admin_email);
  if (!to || to === 'admin@webshop.local') return;
  var body = simpleMail_('Afrifacts systeemcheck: actie nodig', 'De automatische systeemcheck vond problemen:\n\n' + issues.join('\n') + '\n\nProducten: ' + result.products + '\nPubliek: ' + result.public_products);
  sendEmail_(to, 'Afrifacts systeemcheck: ' + issues.length + ' probleem/problemen', body, 'system_check_failed', 'system', 'health');
}

function installAutomationTriggers_() {
  var names = { autoSyncDriveImages: true, systemHealthCheck: true };
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (names[trigger.getHandlerFunction()]) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('autoSyncDriveImages').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('systemHealthCheck').timeBased().everyMinutes(10).create();
  return { installed: ['autoSyncDriveImages', 'systemHealthCheck'], interval_minutes: 10 };
}

function valueAt_(row, index) {
  return index === -1 ? '' : row[index];
}

function appendProductImageIfPresent_(productId, payload) {
  var driveId = extractDriveId_(payload.drive_file_id || payload.image_url);
  var url = clean_(payload.image_url);
  if (!driveId && !url) return;
  if (driveId) makeDriveFilePublic_(driveId);
  append_('product_images', { image_id: id_('IMG'), product_id: productId, drive_file_id: driveId, image_url: driveId ? convertDriveUrlToThumbnail_(driveId, 1000) : url, sort_order: Math.floor(num_(payload.sort_order)), created_at: now_() });
}

function appendProductImagesIfPresent_(productId, payload) {
  var raw = clean_(payload.image_urls || payload.extra_image_urls);
  if (!raw) return;
  raw.split(/[\n,]+/).forEach(function(value, index) {
    value = clean_(value);
    if (!value) return;
    var driveId = extractDriveId_(value);
    if (driveId) makeDriveFilePublic_(driveId);
    append_('product_images', {
      image_id: id_('IMG'),
      product_id: productId,
      drive_file_id: driveId,
      image_url: driveId ? convertDriveUrlToThumbnail_(driveId, 1000) : value,
      sort_order: index + 2,
      created_at: now_()
    });
  });
}

function productImageMap_() {
  var map = {};
  rows_('product_images').forEach(function(i) {
    var id = clean_(i.product_id);
    if (!id) return;
    if (!map[id]) map[id] = [];
    map[id].push(i);
  });
  return map;
}

function productImages_(productId, product, imageMap) {
  var source = imageMap ? (imageMap[clean_(productId)] || []) : rows_('product_images').filter(function(i) { return clean_(i.product_id) === clean_(productId); });
  var seen = {};
  var images = [];
  function pushImage(imageId, value, driveId) {
    var url = driveId ? convertDriveUrlToThumbnail_(driveId, 1000) : convertDriveUrlToThumbnail_(value, 1000);
    if (!url || seen[url]) return;
    seen[url] = true;
    images.push({ image_id: imageId, url: url, drive_file_id: driveId || extractDriveId_(value) });
  }
  if (product && product.image_url) pushImage('main', product.image_url, extractDriveId_(product.image_url));
  source.sort(function(a, b) { return num_(a.sort_order) - num_(b.sort_order); }).forEach(function(i) {
    pushImage(i.image_id, i.image_url, clean_(i.drive_file_id));
  });
  return images;
}

function firstProductImage_(productId, product, imageMap) {
  var images = productImages_(productId, product, imageMap);
  return images.length ? images[0].url : '';
}

function logOrderHistory_(orderId, actor, action, oldValue, newValue, notes) {
  append_('order_history', { history_id: id_('HIS'), order_id: orderId, created_at: now_(), actor: clean_(actor), action: clean_(action), old_value: clean_(oldValue), new_value: clean_(newValue), notes: clean_(notes) });
}

function buildMailWarnings_(emails) {
  var today = ymd_(new Date());
  var sentToday = {};
  (emails || []).forEach(function(e) { if (ymd_(e.created_at) === today && clean_(e.status) === 'sent') sentToday[clean_(e.template || e.type)] = true; });
  return Object.keys(sentToday).map(function(type) { return 'Er is vandaag al een ' + type + ' mail verstuurd.'; });
}

function getProductProfitStats_() {
  var items = rows_('order_items');
  var map = {};
  var total = 0;
  items.forEach(function(i) {
    var profit = i.profit !== '' && i.profit !== undefined ? num_(i.profit) : (num_(i.price) - num_(i.cost_price)) * num_(i.quantity);
    total += profit;
    var key = i.product_id || i.product_name;
    if (!map[key]) map[key] = { product_id: i.product_id, name: i.product_name, quantity: 0, profit: 0 };
    map[key].quantity += num_(i.quantity);
    map[key].profit += profit;
  });
  return { total_profit: total, products: Object.keys(map).map(function(k) { map[k].profit = money_(map[k].profit); return map[k]; }) };
}

function resolveDateRange_(payload) {
  var now = new Date();
  var start = null;
  var end = null;
  var period = clean_(payload.period || 'all');
  if (period === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (period === 'week') {
    start = startOfWeek_(now);
    end = dateAddDays_(start, 7);
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (period === 'quarter') {
    var quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
    end = new Date(now.getFullYear(), quarterMonth + 3, 1);
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }
  if (payload.date_from) start = new Date(payload.date_from);
  if (payload.date_to) end = dateAddDays_(new Date(payload.date_to), 1);
  return { start: start, end: end };
}

function isInDateRange_(value, range) {
  var time = new Date(value).getTime();
  if (isNaN(time)) return false;
  if (range.start && time < range.start.getTime()) return false;
  if (range.end && time >= range.end.getTime()) return false;
  return true;
}

function dateAddDays_(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function esc_(value) {
  return clean_(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function jsonSafe_(value) {
  return JSON.parse(JSON.stringify(value));
}
