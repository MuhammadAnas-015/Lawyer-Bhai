import { createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────
//  Translation dictionary — every UI string in EN + UR
// ─────────────────────────────────────────────────────────────
export const STRINGS = {
  // ── Sidebar ──
  "nav.home":        { en: "Home",        ur: "ہوم" },
  "nav.legalGuide":  { en: "Legal Guide", ur: "قانونی رہنمائی" },
  "nav.documents":   { en: "Documents",   ur: "دستاویزات" },
  "nav.lawBook":     { en: "Law Book",    ur: "قانون کی کتاب" },
  "nav.myCases":     { en: "My Cases",    ur: "میرے کیسز" },
  "nav.findVakeel":  { en: "Find Vakeel", ur: "وکیل ڈھونڈیں" },

  // ── TopBar dropdown ──
  "menu.profile":   { en: "My Profile", ur: "میری پروفائل" },
  "menu.settings":  { en: "Settings",   ur: "ترتیبات" },
  "menu.signout":   { en: "Sign Out",   ur: "سائن آؤٹ" },

  // ── Home ──
  "home.greeting":   { en: "Assalam-o-Alaikum", ur: "السلام علیکم" },
  "home.subtitle":   { en: "Pakistan's most trusted AI legal assistant — at your service", ur: "پاکستان کا سب سے قابل اعتماد AI قانونی معاون — آپ کی خدمت میں" },
  "home.docTitle":   { en: "Document Upload", ur: "دستاویز اپلوڈ کریں" },
  "home.docDesc":    { en: "Upload a contract or document — AI will explain risks, clauses & summary", ur: "کنٹریکٹ یا دستاویز اپلوڈ کریں — AI رسک، شقیں اور خلاصہ بتائے گا" },
  "home.guideTitle": { en: "Legal Guide", ur: "قانونی رہنمائی" },
  "home.guideDesc":  { en: "Ask your problem — Lawyer Bhai AI answers per Pakistani law", ur: "اپنا مسئلہ پوچھیں — لائر بھائی AI پاکستانی قانون کے مطابق جواب دے گا" },
  "home.mashwara":   { en: "Advice", ur: "مشورہ" },

  // ── Legal Guide ──
  "lg.title":       { en: "Legal Guide — Advice", ur: "قانونی رہنمائی — مشورہ" },
  "lg.subtitle":    { en: "Describe your case or problem — AI matches Pakistani laws and gives advice", ur: "اپنا کیس یا مسئلہ بیان کریں — AI پاکستانی قوانین سے ملا کر مشورہ دے گا" },
  "lg.inputLabel":  { en: "Write Your Problem", ur: "اپنا مسئلہ لکھیں" },
  "lg.placeholder": { en: "Example: My landlord wants to raise rent 30% without notice…", ur: "مثال: میرا مکان مالک بغیر نوٹس کے کرایہ 30% بڑھانا چاہتا ہے…" },
  "lg.searchBtn":   { en: "Find Laws", ur: "قانون ڈھونڈیں" },
  "lg.searching":   { en: "Searching…", ur: "تلاش جاری…" },
  "lg.processing":  { en: "Searching for matches in Pakistani laws…", ur: "پاکستانی قوانین میں میچ تلاش کیا جا رہا ہے…" },
  "lg.winChance":   { en: "Case Strength", ur: "کیس کی مضبوطی" },
  "lg.confidence":  { en: "Confidence", ur: "اعتماد" },
  "lg.aiAdvice":    { en: "AI Advice", ur: "AI مشورہ" },
  "lg.demoMode":    { en: "Backend offline — demo mode", ur: "بیک اینڈ آف لائن — ڈیمو موڈ" },
  "lg.matchedLaws": { en: "Relevant Laws (Matched)", ur: "متعلقہ قوانین" },
  "lg.highMatch":   { en: "High Match", ur: "زیادہ میچ" },
  "lg.possible":    { en: "Possible", ur: "ممکنہ" },

  // ── Documents ──
  "docs.title":     { en: "Document Analysis", ur: "دستاویز کا تجزیہ" },
  "docs.upload":    { en: "Upload Document", ur: "دستاویز اپلوڈ کریں" },
  "docs.uploadDesc":{ en: "Drop a PDF or image — OCR + AI will analyze it", ur: "PDF یا تصویر ڈراپ کریں — OCR + AI تجزیہ کرے گا" },
  "docs.selectFile":{ en: "Select File", ur: "فائل منتخب کریں" },
  "docs.processing":{ en: "Processing document — OCR + AI analysis…", ur: "دستاویز پر کام جاری — OCR + AI تجزیہ…" },
  "docs.newDoc":    { en: "New Document", ur: "نئی دستاویز" },
  "docs.extracted": { en: "Extracted Text (OCR)", ur: "نکالا گیا متن (OCR)" },
  "docs.strength":  { en: "Document Strength", ur: "دستاویز کی مضبوطی" },

  // ── Law Book ──
  "lb.title":    { en: "Law Book", ur: "قانون کی کتاب" },
  "lb.subtitle": { en: "Pakistan's core laws — search or pick a category", ur: "پاکستان کے بنیادی قوانین — تلاش کریں یا زمرہ منتخب کریں" },
  "lb.search":   { en: "Search a law…", ur: "قانون تلاش کریں…" },
  "cat.all":      { en: "All", ur: "تمام" },
  "cat.criminal": { en: "Criminal", ur: "فوجداری" },
  "cat.civil":    { en: "Civil", ur: "دیوانی" },
  "cat.constitutional": { en: "Constitutional", ur: "آئینی" },
  "cat.family":   { en: "Family", ur: "خاندانی" },
  "cat.property": { en: "Property", ur: "جائیداد" },
  "cat.labor":    { en: "Labor", ur: "محنت" },

  // ── My Cases ──
  "cases.title":    { en: "My Cases", ur: "میرے کیسز" },
  "cases.subtitle": { en: "Track your legal cases", ur: "اپنے قانونی کیسز کو ٹریک کریں" },
  "cases.new":      { en: "+ New Case", ur: "+ نیا کیس" },
  "cases.loading":  { en: "Loading cases…", ur: "کیسز لوڈ ہو رہے ہیں…" },
  "cases.empty":    { en: "No cases yet", ur: "ابھی کوئی کیس نہیں" },
  "cases.emptyHint":{ en: 'Add your first case with "+ New Case"', ur: '"+ نیا کیس" سے اپنا پہلا کیس شامل کریں' },
  "cases.modalTitle":{ en: "New Case", ur: "نیا کیس" },
  "cases.fTitle":   { en: "Case Title *", ur: "کیس کا عنوان *" },
  "cases.fTitlePh": { en: "Example: Landlord rent dispute", ur: "مثال: مکان مالک کرایہ تنازعہ" },
  "cases.fDesc":    { en: "Details (optional)", ur: "تفصیل (اختیاری)" },
  "cases.fDescPh":  { en: "About the case…", ur: "کیس کے بارے میں…" },
  "cases.fCategory":{ en: "Category", ur: "زمرہ" },
  "cases.fStatus":  { en: "Status", ur: "حالت" },
  "cases.add":      { en: "Add Case", ur: "کیس شامل کریں" },
  "cases.saving":   { en: "Saving…", ur: "محفوظ ہو رہا…" },
  "cases.delete":   { en: "Delete", ur: "حذف کریں" },
  "cases.complete": { en: "complete", ur: "مکمل" },
  "status.active":  { en: "Active", ur: "فعال" },
  "status.pending": { en: "Pending", ur: "زیر التواء" },
  "status.closed":  { en: "Closed", ur: "بند" },

  // ── Find Vakeel ──
  "fv.title":    { en: "Find Vakeel", ur: "وکیل ڈھونڈیں" },
  "fv.subtitle": { en: "Find an experienced lawyer for your case", ur: "اپنے کیس کے لیے تجربہ کار وکیل تلاش کریں" },
  "fv.experience": { en: "experience", ur: "تجربہ" },
  "fv.cases":    { en: "cases", ur: "کیسز" },
  "fv.contact":  { en: "Contact", ur: "رابطہ" },
  "fv.corporate":{ en: "Corporate", ur: "کارپوریٹ" },
  "fv.employment": { en: "Employment", ur: "روزگار" },

  // ── Profile ──
  "profile.verified":  { en: "Verified Member", ur: "تصدیق شدہ ممبر" },
  "profile.documents": { en: "Documents", ur: "دستاویزات" },
  "profile.totalCases":{ en: "Total Cases", ur: "کل کیسز" },
  "profile.activeCases":{ en: "Active Cases", ur: "فعال کیسز" },
  "profile.accountInfo":{ en: "Account Information", ur: "اکاؤنٹ کی معلومات" },
  "profile.edit":      { en: "Edit", ur: "ترمیم" },
  "profile.fullName":  { en: "Full Name", ur: "پورا نام" },
  "profile.email":     { en: "Email Address", ur: "ای میل ایڈریس" },
  "profile.phone":     { en: "Phone Number", ur: "فون نمبر" },
  "profile.city":      { en: "City", ur: "شہر" },
  "profile.memberSince":{ en: "Member Since", ur: "ممبر بنے" },
  "profile.save":      { en: "Save Changes", ur: "تبدیلیاں محفوظ کریں" },
  "profile.cancel":    { en: "Cancel", ur: "منسوخ" },

  // ── Settings ──
  "set.title":    { en: "Settings", ur: "ترتیبات" },
  "set.subtitle": { en: "Manage your app and account settings", ur: "اپنی ایپ اور اکاؤنٹ کی ترتیبات منظم کریں" },
  "set.language": { en: "Language / Zaban", ur: "زبان / Language" },
  "set.notifications": { en: "Notifications", ur: "اطلاعات" },
  "set.emailNotif":{ en: "Email Notifications", ur: "ای میل اطلاعات" },
  "set.emailNotifDesc": { en: "Case updates and reminders via email", ur: "کیس اپڈیٹس اور ریمائنڈرز ای میل پر" },
  "set.productUpdates": { en: "Product Updates", ur: "پروڈکٹ اپڈیٹس" },
  "set.productUpdatesDesc": { en: "New features and news", ur: "نئے فیچرز اور خبریں" },
  "set.changePw": { en: "Change Password", ur: "پاس ورڈ تبدیل کریں" },
  "set.newPw":    { en: "New password (6+ characters)", ur: "نیا پاس ورڈ (6+ حروف)" },
  "set.confirmPw":{ en: "Re-type password", ur: "پاس ورڈ دوبارہ لکھیں" },
  "set.updatePw": { en: "Update Password", ur: "پاس ورڈ اپڈیٹ کریں" },
  "set.updating": { en: "Updating…", ur: "اپڈیٹ ہو رہا…" },
  "set.account":  { en: "Account", ur: "اکاؤنٹ" },
  "set.signedInAs": { en: "Signed in as", ur: "سائن ان بطور" },
  "set.pwShort":  { en: "Password must be at least 6 characters.", ur: "پاس ورڈ کم از کم 6 حروف کا ہو۔" },
  "set.pwMismatch": { en: "Passwords do not match.", ur: "دونوں پاس ورڈ میچ نہیں کرتے۔" },
  "set.pwChanged": { en: "Password changed!", ur: "پاس ورڈ تبدیل ہو گیا!" },

  // ── Floating Chat (LawyerGPT) ──
  "chat.name":   { en: "Lawyer Bhai AI", ur: "لائر بھائی AI" },
  "chat.status": { en: "Online — Pakistani Law Expert", ur: "آن لائن — پاکستانی قانون ماہر" },
  "chat.greeting": { en: "Assalam-o-Alaikum! I am Lawyer Bhai AI. Ask any legal question — I'll help! 👋", ur: "السلام علیکم! میں لائر بھائی AI ہوں۔ کوئی بھی قانونی سوال پوچھیں — میں مدد کروں گا! 👋" },
  "chat.placeholder": { en: "Type your legal question…", ur: "اپنا قانونی سوال لکھیں…" },

  // ── Auth ──
  "auth.welcome":  { en: "Welcome Back", ur: "خوش آمدید" },
  "auth.create":   { en: "Create Account", ur: "اکاؤنٹ بنائیں" },
  "auth.tagline":  { en: "Pakistan's most trusted AI legal assistant", ur: "پاکستان کا سب سے قابل اعتماد AI قانونی معاون" },
  "auth.google":   { en: "Continue with Google", ur: "گوگل سے جاری رکھیں" },
  "auth.or":       { en: "or", ur: "یا" },
  "auth.login":    { en: "Login", ur: "لاگ ان" },
  "auth.signup":   { en: "Sign Up", ur: "سائن اپ" },
  "auth.fullName": { en: "Full Name", ur: "پورا نام" },
  "auth.namePh":   { en: "Your Name", ur: "آپ کا نام" },
  "auth.email":    { en: "Email", ur: "ای میل" },
  "auth.password": { en: "Password", ur: "پاس ورڈ" },
  "auth.remember": { en: "Remember me", ur: "مجھے یاد رکھیں" },
  "auth.loginBtn": { en: "Login", ur: "لاگ ان" },
  "auth.createBtn":{ en: "Create Account", ur: "اکاؤنٹ بنائیں" },
  "auth.forgot":   { en: "Forgot your password?", ur: "پاس ورڈ بھول گئے؟" },
};

// Detect language of a free-text message: "ur" | "roman-ur" | "en"
export const detectTextLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const t = text.toLowerCase();
  const romanUrdu = ["mera","meri","mujhe","kya","hai","kaise","karna","nahi","aap","mein","hain","wala","kar","raha","rahi","gaya","kiya","masla","kiraya","talaq","naukri","zameen","chori","dhoka","makan","shadi","bachay","nikah","sawaal","batao","chahiye","hota","hoti","maalik","bina","notice","barha"];
  const words = t.split(/\s+/);
  const hits = words.filter((w) => romanUrdu.includes(w)).length;
  return hits >= 2 ? "roman-ur" : "en";
};

const LangContext = createContext({ lang: "en", t: (k) => k });

export const LangProvider = ({ lang, children }) => {
  const t = (key) => {
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };
  return <LangContext.Provider value={{ lang, t }}>{children}</LangContext.Provider>;
};

export const useT = () => useContext(LangContext);
