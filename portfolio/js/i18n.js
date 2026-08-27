// ========================
// i18n Translation System
// ========================
const I18N = {
    en: {
        // Nav
        nav_home: "Home", nav_about: "About", nav_experience: "Experience",
        nav_skills: "Skills", nav_projects: "Projects", nav_contact: "Contact",
        // Hero
        hero_greeting: "Hello, I'm",
        hero_description: "Backend-focused AI engineer building production systems with Python, FastAPI, and Django. Shipping ML pipelines, LLM-powered applications, and security tools end-to-end.",
        hero_btn_work: "Work Showcase", hero_btn_contact: "Reach Out",
        // Typing words
        typing_words: JSON.stringify([
            "Building AI that cuts costs & replaces busywork",
            "Shipping ML pipelines from idea to production",
            "Automating workflows with LLMs & agents",
            "Turning security risks into solved problems"
        ]),
        // About
        about_tag: "About", about_title: "Who I Am",
        about_subtitle: "AI Engineer & Backend Developer",
        about_p1: "Backend-focused AI engineer working primarily with Python, FastAPI, and Django. My experience spans ML pipelines, LLM automation, and security applications\u2014phishing detection and red teaming in particular.",
        about_p2: "With a freelance background, delivering production systems end-to-end: from client requirements through architecture decisions to deployment. Building AI applications that solve real problems, integrating models into REST APIs, and handling real-time inference and system automation.",
        about_edu_label: "Education", about_edu_val: "BSc in AI & Cybersecurity",
        about_loc_label: "Location", about_loc_val: "Mansoura, Egypt",
        about_avail_label: "Availability", about_avail_val: "Open to Remote",
        about_cv: "Download CV",
        // Experience
        exp_tag: "Career", exp_title: "Experience",
        exp1_role: "AI Trainer \u2014 Master Coding Specialist",
        exp1_company: "Invisible Technologies", exp1_type: "Contract",
        exp1_date: "Dec 2025 \u2014 Present",
        exp1_d1: "Reviewed and debugged 400+ complex Python scripts to train LLM models on algorithmic correctness and reasoning.",
        exp1_d2: "Built high-quality evaluation datasets and edge-case tests, improving model accuracy on coding tasks by up to 15%.",
        exp1_d3: "Supported bilingual (Arabic/English) RLHF training workflows to align models with localized safety guidelines.",
        exp1_d4: "Provided specialized technical expertise on backend architecture, API integrations, and scripting challenges.",
        exp2_role: "AI Engineer",
        exp2_company: "Self-Employed / Freelance", exp2_type: "Remote",
        exp2_date: "Jan 2022 \u2014 Present",
        exp2_d1: "Built and deployed 10+ production AI applications for automation and security using Python, FastAPI, and Django.",
        exp2_d2: "Developed an ML pipeline for phishing detection that reduced successful client intrusions by 25%.",
        exp2_d3: "Integrated ML models into scalable REST APIs, processing thousands of real-time inference requests daily.",
        exp2_d4: "Led end-to-end delivery from architecture to deployment, successfully delivering 100% of projects within client timelines.",
        exp2_d5: "Optimized model performance and latency, consistently achieving sub-200ms response times for critical backend services.",
        // Education
        edu_header: "Education",
        edu_degree: "Bachelor of Science in Artificial Intelligence & Cybersecurity",
        edu_place: "Delta University for Science and Technology \u2014 Mansoura, Egypt",
        edu_date: "Oct 2022 \u2014 Jul 2026  |  GPA: 3.2 / 4.0",
        edu_certs: "Certifications",
        cert1: "NVIDIA Deep Learning Institute (DLI) \u2014 ITI",
        cert2: "Building LLM Applications with Prompt Engineering",
        cert3: "Building Agentic AI \u2014 Andrew Ng",
        cert4: "25+ Technical Courses \u2014 Coursera",
        // Skills
        skills_tag: "Expertise", skills_title: "Technical Skills",
        tab_all: "All", tab_backend: "Backend & Languages", tab_ml: "Machine Learning",
        tab_llm: "LLMs & Agents", tab_db: "Databases", tab_devops: "DevOps & Tools", tab_security: "Security",
        // Skill labels (technical terms stay the same)
        sk_feature_eng: "Feature Engineering", sk_model_training: "Model Training",
        sk_agent_workflows: "Agent Workflows", sk_tool_calling: "Tool Calling",
        sk_multi_agent: "Multi-Agent Systems", sk_phishing: "Phishing Detection",
        sk_red_team: "Red Teaming Automation", sk_sec_ml: "Security-Focused ML",
        // Projects
        proj_tag: "Portfolio", proj_title: "Featured Projects",
        proj_view_gh: "View on GitHub", proj_view_all: "View All Repositories",
        // Project 1
        p1_title: "AI Red Teaming Agent",
        p1_problem: "Organizations need continuous, automated security testing to identify vulnerabilities before real attackers do.",
        p1_solution: "Automated agent that simulates phishing campaigns and cyberattacks for security testing. Runs continuous threat simulations to test system defenses. Helped reduce successful phishing attempts by 25% over three months during evaluation.",
        // Project 2
        p2_title: "WhatsApp Clinic AI Agent",
        p2_problem: "Clinics struggle with patient communication overhead\u2014manual updates, missed appointments, and fragmented records.",
        p2_solution: "Patient communication system using NLP for automated medical messaging. Integrates with the WhatsApp API for real-time updates and two-way engagement. Backend pulls patient data and displays it on physician dashboards showing appointment status and medical history.",
        // Project 3
        p3_title: "ML Phishing URL Detection System",
        p3_problem: "Phishing URLs are increasingly sophisticated, requiring automated detection that goes beyond simple blacklists.",
        p3_solution: "ML system that detects phishing URLs by extracting features from URL structure, domains, and IP metadata. Trained classifiers to flag malicious links with minimal false positives. Deployed as a backend service for automated threat blocking.",
        // Project 4
        p4_title: "User Behavior Analytics Engine",
        p4_problem: "Insider threats and compromised accounts go undetected by rule-based systems that can't adapt to evolving attack patterns.",
        p4_solution: "Multi-model ML system for real-time user behavior analytics and threat detection. Combines anomaly detection, classification, and clustering models to profile normal behavior and flag deviations. Built with a web-based dashboard for security teams to monitor risk scores and investigate alerts.",
        // Project 5
        p5_title: "AI Code Vulnerability Scanner",
        p5_problem: "Manual code reviews miss critical vulnerabilities, and traditional static analysis tools produce excessive false positives without actionable context.",
        p5_solution: "LLM-powered agent that automatically scans codebases for security vulnerabilities including SQL injection, XSS, and directory traversal. Uses AI reasoning to analyze code context, reduce false positives, and provide developer-friendly remediation suggestions with severity scoring.",
        // Project 6
        p6_title: "Traction Control Simulator",
        p6_problem: "Developing and testing vehicle traction control algorithms requires expensive hardware setups and real-world driving conditions that are hard to replicate consistently.",
        p6_solution: "Physics-based simulation of vehicle traction control systems using Python. Models tire slip ratios, road surface friction, wheel speed dynamics, and torque distribution. Enables rapid prototyping and testing of control algorithms for automotive safety systems in a virtual environment.",
        // Project 7
        p7_title: "Medical AI: X-ray Cardiomegaly Detection",
        p7_problem: "Radiologists face high workloads reviewing chest X-rays, and early signs of cardiomegaly (enlarged heart) can be missed in time-pressured clinical settings.",
        p7_solution: "Deep learning system that analyzes chest X-ray images to detect signs of cardiomegaly. Uses convolutional neural networks to compute cardiothoracic ratios and classify abnormalities. Includes a web interface for clinicians to upload images and view diagnostic results with confidence scores and heatmap visualizations.",
        // Project 8
        p8_title: "ML Vulnerability Detection & Risk Assessment",
        p8_problem: "Enterprise systems accumulate thousands of potential vulnerabilities, and security teams lack automated tools to prioritize which threats pose the highest real-world risk.",
        p8_solution: "Machine learning pipeline that classifies software vulnerabilities and scores them using risk assessment models. Extracts features from CVE data, code patterns, and deployment context to predict exploitability and impact. Outputs actionable risk reports with prioritized remediation paths for security operations teams.",
        // Contact
        contact_tag: "Contact", contact_title: "Reach Out",
        contact_subtitle: "Let's Turn Ideas Into Reality",
        contact_desc: "Open to freelance work, contract roles, and remote positions. Looking for an AI engineer to take a project from requirements to production? Let's talk.",
        contact_email_label: "Email", contact_phone_label: "Phone",
        contact_loc_label: "Location", contact_loc_val: "Mansoura, Egypt \u2014 Open to Remote",
        ph_name: "Your Name", ph_email: "Your Email", ph_subject: "Subject", ph_message: "Your Message",
        contact_send: "Send Message",
        // Footer
        footer_copy: "\u00a9 2026 Mahmoud Osama. All Rights Reserved.",
        // Problem label
        problem_label: "Problem:",
        // Lang toggle
        lang_label: "AR",
        // Blog
        nav_blog: "Blog",
        blog_tag: "Writing",
        blog_title: "Blog",
        blog_subtitle: "Technical articles, career insights, and things I've learned building AI systems.",
        blog_back: "Back to Portfolio",
        blog_cta: "Read My Blog",
        blog_heading: "Technical Writing & Insights.",
        blog_latest: "Latest",
        blog_latest_title: "Tech Job Market in Egypt 2026",
        blog_latest_excerpt: "Software Engineering vs AI Engineering \u2014 a data-driven comparison of career paths and salaries.",
        blog_read_article: "Read article"
    },

    ar: {
        nav_home: "الرئيسية", nav_about: "عنّي", nav_experience: "الخبرة",
        nav_skills: "المهارات", nav_projects: "المشاريع", nav_contact: "تواصل",
        hero_greeting: "مرحبًا، أنا",
        hero_description: "مهندس ذكاء اصطناعي متخصص في بناء أنظمة إنتاجية باستخدام Python وFastAPI وDjango. تطوير وتجهيز خطوط ML وتطبيقات LLM وأدوات أمنية من البداية للنهاية.",
        hero_btn_work: "شاهد أعمالي", hero_btn_contact: "تواصل معي",
        typing_words: JSON.stringify([
            "بناء أنظمة ذكاء اصطناعي تقلل التكاليف وتستبدل العمل المتكرر",
            "نقل خطوط ML من الفكرة إلى الإنتاج",
            "أتمتة سير العمل باستخدام نماذج اللغة والوكلاء",
            "تحويل المخاطر الأمنية إلى مشكلات محلولة"
        ]),
        about_tag: "عنّي", about_title: "من أنا",
        about_subtitle: "مهندس ذكاء اصطناعي ومطور خلفي",
        about_p1: "مهندس ذكاء اصطناعي متخصص في الخلفية يعمل أساسًا مع Python وFastAPI وDjango. تمتد خبرتي لتشمل خطوط ML وأتمتة LLM وتطبيقات الأمان — خاصة كشف التصيد والفريق الأحمر.",
        about_p2: "بخلفية عمل حر، تسليم أنظمة إنتاجية شاملة: من متطلبات العميل عبر قرارات التصميم إلى النشر. بناء تطبيقات ذكاء اصطناعي تحل مشكلات حقيقية ودمج النماذج في واجهات REST APIs.",
        about_edu_label: "التعليم", about_edu_val: "بكالوريوس ذكاء اصطناعي وأمن سيبراني",
        about_loc_label: "الموقع", about_loc_val: "المنصورة، مصر",
        about_avail_label: "الإتاحة", about_avail_val: "متاح للعمل عن بُعد",
        about_cv: "تحميل السيرة الذاتية",
        exp_tag: "المسيرة", exp_title: "الخبرة",
        exp1_role: "مدرب ذكاء اصطناعي — أخصائي برمجة متقدم",
        exp1_company: "Invisible Technologies", exp1_type: "تعاقد",
        exp1_date: "ديسمبر 2025 — الحالي",
        exp1_d1: "مراجعة وتصحيح أكثر من 400 نص برمجي معقد بلغة Python لتدريب نماذج LLM على الدقة الخوارزمية والتفكير.",
        exp1_d2: "بناء مجموعات بيانات تقييم واختبارات حالات متطرفة، مما أدى إلى تحسين دقة النماذج في المهام البرمجية بنسبة تصل إلى 15%.",
        exp1_d3: "دعم سير عمل تدريب RLHF ثنائي اللغة (عربي/إنجليزي) لمواءمة النماذج مع إرشادات الأمان المترجمة.",
        exp1_d4: "تقديم خبرات تقنية متخصصة في بنية الواجهة الخلفية وتكامل API وتحديات البرمجة النصية.",
        exp2_role: "مهندس ذكاء اصطناعي",
        exp2_company: "عمل حر / مستقل", exp2_type: "عن بُعد",
        exp2_date: "يناير 2022 — الحالي",
        exp2_d1: "بناء ونشر أكثر من 10 تطبيقات ذكاء اصطناعي إنتاجية للأتمتة والأمان باستخدام Python وFastAPI وDjango.",
        exp2_d2: "تطوير خط أنابيب ML لاكتشاف التصيد الاحتيالي أدى إلى تقليل اختراقات العملاء الناجحة بنسبة 25%.",
        exp2_d3: "دمج نماذج ML في واجهات برمجة تطبيقات REST قابلة للتطوير، ومعالجة آلاف طلبات الاستدلال في الوقت الفعلي يوميًا.",
        exp2_d4: "قيادة التسليم من البداية إلى النهاية بدءًا من البنية وصولاً إلى النشر، مع تسليم 100% من المشاريع ضمن الجداول الزمنية للعملاء.",
        exp2_d5: "تحسين أداء النموذج ووقت الاستجابة، مع تحقيق أوقات استجابة أقل من 200 مللي ثانية باستمرار لخدمات الواجهة الخلفية الحيوية.",
        edu_header: "التعليم",
        edu_degree: "بكالوريوس العلوم في الذكاء الاصطناعي والأمن السيبراني",
        edu_place: "جامعة الدلتا للعلوم والتكنولوجيا — المنصورة، مصر",
        edu_date: "أكتوبر 2022 — يوليو 2026  |  المعدل: 3.2 / 4.0",
        edu_certs: "الشهادات",
        cert1: "معهد NVIDIA للتعلم العميق (DLI) — ITI",
        cert2: "بناء تطبيقات LLM مع هندسة البرومبت",
        cert3: "بناء الذكاء الاصطناعي الوكيل — Andrew Ng",
        cert4: "+25 دورة تقنية — Coursera",
        skills_tag: "الخبرات", skills_title: "المهارات التقنية",
        tab_all: "الكل", tab_backend: "الخلفية واللغات", tab_ml: "تعلم الآلة",
        tab_llm: "نماذج اللغة والوكلاء", tab_db: "قواعد البيانات", tab_devops: "DevOps والأدوات", tab_security: "الأمان",
        sk_feature_eng: "هندسة الميزات", sk_model_training: "تدريب النماذج",
        sk_agent_workflows: "سير عمل الوكلاء", sk_tool_calling: "استدعاء الأدوات",
        sk_multi_agent: "أنظمة متعددة الوكلاء", sk_phishing: "كشف التصيد",
        sk_red_team: "أتمتة الفريق الأحمر", sk_sec_ml: "ML أمني",
        proj_tag: "أعمالي", proj_title: "المشاريع المميزة",
        proj_view_gh: "عرض على GitHub", proj_view_all: "عرض جميع المستودعات",
        p1_title: "وكيل الفريق الأحمر بالذكاء الاصطناعي",
        p1_problem: "تحتاج المؤسسات لاختبار أمني مستمر ومؤتمت لتحديد الثغرات قبل المهاجمين الحقيقيين.",
        p1_solution: "وكيل آلي يحاكي حملات التصيد والهجمات الإلكترونية للاختبار الأمني. يشغّل محاكاة تهديدات مستمرة لاختبار دفاعات النظام. ساعد في تقليل محاولات التصيد الناجحة بنسبة 25% خلال ثلاثة أشهر.",
        p2_title: "وكيل عيادة واتساب بالذكاء الاصطناعي",
        p2_problem: "تعاني العيادات من عبء التواصل مع المرضى — تحديثات يدوية ومواعيد ضائعة وسجلات مجزأة.",
        p2_solution: "نظام تواصل مع المرضى يستخدم NLP للرسائل الطبية الآلية. يتكامل مع واجهة واتساب للتحديثات الفورية. يسحب بيانات المرضى ويعرضها على لوحات الأطباء.",
        p3_title: "نظام كشف روابط التصيد بـ ML",
        p3_problem: "روابط التصيد أصبحت متطورة بشكل متزايد وتتطلب كشفًا آليًا يتجاوز القوائم السوداء.",
        p3_solution: "نظام ML يكشف روابط التصيد عبر استخراج الميزات من بنية الروابط والنطاقات وبيانات IP. مصنفات مدربة لتمييز الروابط الخبيثة مع أقل إنذارات كاذبة.",
        p4_title: "محرك تحليلات سلوك المستخدم",
        p4_problem: "التهديدات الداخلية والحسابات المخترقة لا تُكشف بواسطة الأنظمة القائمة على القواعد.",
        p4_solution: "نظام ML متعدد النماذج لتحليلات سلوك المستخدم في الوقت الفعلي وكشف التهديدات. يجمع بين كشف الشذوذ والتصنيف والتجميع مع لوحة معلومات لفرق الأمان.",
        p5_title: "ماسح ثغرات الكود بالذكاء الاصطناعي",
        p5_problem: "المراجعة اليدوية للكود تفوت ثغرات حرجة، وأدوات التحليل الثابت تنتج إنذارات كاذبة مفرطة.",
        p5_solution: "وكيل مدعوم بنماذج اللغة يفحص الأكواد تلقائيًا بحثًا عن ثغرات أمنية مثل SQL injection وXSS مع اقتراحات إصلاح وتسجيل خطورة.",
        p6_title: "محاكي التحكم في الجر",
        p6_problem: "تطوير واختبار خوارزميات التحكم في الجر يتطلب إعدادات أجهزة مكلفة وظروف قيادة حقيقية.",
        p6_solution: "محاكاة فيزيائية لأنظمة التحكم في جر المركبات باستخدام Python. نمذجة نسب انزلاق الإطارات واحتكاك سطح الطريق وديناميكيات سرعة العجلات.",
        p7_title: "ذكاء اصطناعي طبي: كشف تضخم القلب بالأشعة",
        p7_problem: "يواجه أطباء الأشعة أعباء عمل عالية، وعلامات تضخم القلب المبكرة قد تُفقد في البيئات السريرية.",
        p7_solution: "نظام تعلم عميق يحلل صور الأشعة السينية للصدر لكشف تضخم القلب. يستخدم شبكات CNN لحساب النسب القلبية الصدرية مع واجهة ويب للأطباء.",
        p8_title: "كشف الثغرات وتقييم المخاطر بـ ML",
        p8_problem: "تتراكم آلاف الثغرات المحتملة في أنظمة المؤسسات، وتفتقر فرق الأمان لأدوات تحديد الأولويات.",
        p8_solution: "خط أنابيب ML يصنف ثغرات البرمجيات ويقيمها باستخدام نماذج تقييم المخاطر. يستخرج الميزات من بيانات CVE وأنماط الكود لتوقع قابلية الاستغلال.",
        contact_tag: "تواصل", contact_title: "تواصل معي",
        contact_subtitle: "لنبني شيئًا معًا",
        contact_desc: "متاح للعمل الحر والعقود والمناصب عن بُعد. للبحث عن مهندس ذكاء اصطناعي يأخذ المشروع من المتطلبات إلى الإنتاج، دعنا نتحدث.",
        contact_email_label: "البريد الإلكتروني", contact_phone_label: "الهاتف",
        contact_loc_label: "الموقع", contact_loc_val: "المنصورة، مصر — متاح للعمل عن بُعد",
        ph_name: "اسمك", ph_email: "بريدك الإلكتروني", ph_subject: "الموضوع", ph_message: "رسالتك",
        contact_send: "إرسال الرسالة",
        footer_copy: "\u00a9 2026 محمود أسامة. جميع الحقوق محفوظة.",
        problem_label: "المشكلة:",
        lang_label: "EN",
        nav_blog: "المدونة",
        blog_tag: "كتاباتي",
        blog_title: "المدونة",
        blog_subtitle: "مقالات تقنية ورؤى مهنية وأشياء تعلمتها من بناء أنظمة الذكاء الاصطناعي.",
        blog_back: "العودة للملف الشخصي",
        blog_cta: "اقرأ مدونتي",
        blog_heading: "كتابات تقنية ورؤى.",
        blog_latest: "الأحدث",
        blog_latest_title: "سوق العمل التقني في مصر ٢٠٢٦",
        blog_latest_excerpt: "هندسة البرمجيات مقابل هندسة الذكاء الاصطناعي — مقارنة مبنية على بيانات للمسارات والرواتب.",
        blog_read_article: "اقرأ المقال"
    }
};

// ========================
// Apply translations
// ========================
function applyLanguage(lang) {
    const t = I18N[lang];
    if (!t) return;

    // Set direction & lang attribute
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl', lang === 'ar');

    // Translate all [data-i18n] text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // Translate all [data-i18n-html] (for inner HTML with icons)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) {
            // Preserve leading <i> icon if present
            const icon = el.querySelector('i');
            if (icon) {
                const iconHTML = icon.outerHTML;
                el.innerHTML = iconHTML + ' ' + t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Update typing words
    if (window._updateTypingWords && t.typing_words) {
        window._updateTypingWords(JSON.parse(t.typing_words));
    }

    // Update lang toggle button text
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = t.lang_label;

    // Save preference
    localStorage.setItem('lang', lang);
    window._currentLang = lang;
}

function getInitialLang() {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return browserLang.startsWith('ar') ? 'ar' : 'en';
}

function toggleLanguage() {
    const next = window._currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(next);
}

// Initialize on DOM ready — called from script.js
function initI18n() {
    const lang = getInitialLang();
    applyLanguage(lang);
}
