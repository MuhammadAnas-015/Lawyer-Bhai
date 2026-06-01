-- ============================================================
--  Lawyer Bhai AI — Pakistani Laws Seed Data
--  Sources: Pakistan Penal Code 1860, Constitution 1973,
--           Contract Act 1872, MFLO 1961, Transfer of Property
--           Act 1882, CrPC 1898, CPC 1908, ICEO 1968,
--           DMMA 1939, Guardian & Wards Act 1890
-- ============================================================

INSERT INTO laws (act_name, act_short, section_number, section_title, text_en, text_ur, category, sub_category, keywords, punishment, is_bailable, severity) VALUES

-- ============================================================
--  PAKISTAN PENAL CODE 1860 (PPC)
-- ============================================================

('Pakistan Penal Code 1860', 'PPC', '299',
 'Definitions — Offences Relating to Human Body',
 'Qatl-e-Amd means the intentional killing of a person by doing an act with the intention of causing death or with the intention of causing bodily harm likely to cause death, or by doing an act where the doer knows that the act is so imminently dangerous that it must in all probability cause death.',
 'قتل عمد سے مراد کسی شخص کو جان بوجھ کر قتل کرنا ہے۔',
 'Criminal', 'Murder',
 ARRAY['murder','qatl','qatl-e-amd','killing','death','intentional','qisas'],
 NULL, FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '302',
 'Punishment for Qatl-e-Amd (Murder)',
 'Whoever commits qatl-e-amd shall, subject to the provisions of this Chapter, be punished with death as qisas; or imprisoned for life or imprisonment for a term which may extend to twenty-five years as tazir, where the proof in either of the forms specified under section 304 is not available.',
 'جو شخص قتل عمد کا مرتکب ہو اسے قصاص میں سزائے موت یا عمر قید دی جائے گی۔',
 'Criminal', 'Murder',
 ARRAY['murder','qatl','302','death penalty','life imprisonment','qisas','tazir','intentional killing'],
 'Death (Qisas) or Life Imprisonment (Tazir)', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '304',
 'Punishment for Qatl Shibh-e-Amd',
 'Whoever commits qatl shibh-e-amd shall be punished with diyat and may also be punished with imprisonment of either description for a term which may extend to fourteen years as tazir.',
 'قتل شبہ عمد پر دیت اور چودہ سال تک قید ہو سکتی ہے۔',
 'Criminal', 'Murder',
 ARRAY['qatl','shbh-e-amd','diyat','manslaughter','unintentional killing'],
 'Diyat + up to 14 years imprisonment', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '311',
 'Tazir after Waiver or Compounding of Qisas',
 'Where all the walis of the victim have waived or compounded their right of qisas, the court may, keeping in view the facts and circumstances of the case, punish the offender with imprisonment of either description for a term which may extend to fourteen years as tazir.',
 'قصاص معاف ہونے کے بعد عدالت چودہ سال تک تعزیری سزا دے سکتی ہے۔',
 'Criminal', 'Murder',
 ARRAY['qisas','waiver','compounding','tazir','wali','compromise','murder settlement'],
 'Up to 14 years imprisonment (Tazir)', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '354',
 'Assault or Criminal Force to Woman with Intent to Outrage Modesty',
 'Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.',
 'کسی عورت پر بے حرمتی کی نیت سے حملہ یا طاقت کا استعمال دو سال قید یا جرمانے کا سبب بن سکتا ہے۔',
 'Criminal', 'Assault',
 ARRAY['assault','woman','modesty','outrage','harassment','tazkiya','sexual harassment','eve teasing'],
 'Up to 2 years imprisonment or fine or both', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '376',
 'Punishment for Rape (Zina-bil-Jabr)',
 'Whoever commits rape shall be punished with death or imprisonment of either description for a term which shall not be less than ten years or more than twenty-five years and shall also be liable to fine.',
 'زنا بالجبر کی سزا موت یا دس سے پچیس سال قید ہے۔',
 'Criminal', 'Sexual Violence',
 ARRAY['rape','zina-bil-jabr','sexual assault','violence against women','376'],
 'Death or 10 to 25 years imprisonment + fine', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '379',
 'Punishment for Theft',
 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
 'چوری پر تین سال تک قید یا جرمانہ یا دونوں ہو سکتے ہیں۔',
 'Criminal', 'Theft',
 ARRAY['theft','chori','stealing','snatch','pick pocket','379'],
 'Up to 3 years imprisonment or fine or both', FALSE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '392',
 'Punishment for Robbery',
 'Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years.',
 'ڈکیتی پر دس سال سخت قید اور جرمانہ اور رات کو شاہراہ پر چودہ سال تک ہو سکتے ہیں۔',
 'Criminal', 'Robbery',
 ARRAY['robbery','lootkhasoot','dacoity','snatching','armed robbery','392'],
 'Up to 10 years rigorous imprisonment + fine', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '395',
 'Punishment for Dacoity',
 'Whoever commits dacoity shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.',
 'ڈاکہ ڈالنے پر عمر قید یا دس سال سخت قید اور جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Robbery',
 ARRAY['dacoity','daka','gang robbery','armed gang','395'],
 'Life imprisonment or up to 10 years + fine', FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '406',
 'Punishment for Criminal Breach of Trust',
 'Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.',
 'امانت میں خیانت پر سات سال تک قید یا جرمانہ یا دونوں ہو سکتے ہیں۔',
 'Criminal', 'Fraud',
 ARRAY['breach of trust','amanat','khiyanat','embezzlement','misappropriation','fraud','406'],
 'Up to 7 years imprisonment or fine or both', FALSE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '420',
 'Cheating and Dishonestly Inducing Delivery of Property',
 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.',
 'دھوکہ دہی سے جائیداد حاصل کرنے پر سات سال قید اور جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Fraud',
 ARRAY['cheating','fraud','dhoka','deception','420','property fraud','scam','con'],
 'Up to 7 years imprisonment + fine', FALSE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '441',
 'Criminal Trespass',
 'Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property, commits criminal trespass.',
 'کسی دوسرے کی ملکیت میں بغیر اجازت داخل ہو کر جرم یا ڈرانے دھمکانے کی نیت رکھنا فوجداری تجاوز ہے۔',
 'Criminal', 'Trespass',
 ARRAY['trespass','ghar dakhal','property invasion','unauthorized entry','441'],
 'Up to 3 months imprisonment or fine or both', TRUE, 'Low'),

('Pakistan Penal Code 1860', 'PPC', '447',
 'Punishment for Criminal Trespass',
 'Whoever commits criminal trespass shall be punished with imprisonment of either description for a term which may extend to three months, or with fine which may extend to five hundred rupees, or with both.',
 'فوجداری تجاوز پر تین ماہ قید یا پانچ سو روپے جرمانہ یا دونوں ہو سکتے ہیں۔',
 'Criminal', 'Trespass',
 ARRAY['trespass','punishment','criminal trespass','447'],
 'Up to 3 months imprisonment or Rs.500 fine or both', TRUE, 'Low'),

('Pakistan Penal Code 1860', 'PPC', '448',
 'Punishment for House Trespass',
 'Whoever commits house-trespass shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.',
 'گھر میں ناجائز داخلے پر ایک سال قید یا ایک ہزار روپے جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Trespass',
 ARRAY['house trespass','ghar mein dakhal','home invasion','448'],
 'Up to 1 year imprisonment or Rs.1000 fine or both', TRUE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '499',
 'Defamation',
 'Whoever, by words either spoken or intended to be read, or by signs or by visible representations, makes or publishes any imputation concerning any person intending to harm, or knowing or having reason to believe that such imputation will harm, the reputation of such person, is said, except in the cases hereinafter expected, to defame that person.',
 'جو کوئی کسی شخص کی بدنامی کی نیت سے الزام لگائے وہ ہتک عزت کا مرتکب ہوتا ہے۔',
 'Criminal', 'Defamation',
 ARRAY['defamation','slander','libel','badnami','reputation','hatkk izzat','499'],
 'Up to 2 years imprisonment or fine or both', TRUE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '500',
 'Punishment for Defamation',
 'Whoever defames another shall be punished with simple imprisonment for a term which may extend to two years, or with fine, or with both.',
 'ہتک عزت پر دو سال سادہ قید یا جرمانہ یا دونوں ہو سکتے ہیں۔',
 'Criminal', 'Defamation',
 ARRAY['defamation','punishment','badnami','500'],
 'Up to 2 years simple imprisonment or fine or both', TRUE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '503',
 'Criminal Intimidation',
 'Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.',
 'کسی کو جان، عزت یا مال کا خوف دلانا فوجداری دھمکی ہے۔',
 'Criminal', 'Intimidation',
 ARRAY['threat','intimidation','dhamki','blackmail','extortion','503'],
 'Up to 2 years imprisonment or fine or both', TRUE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '506',
 'Punishment for Criminal Intimidation',
 'Whoever commits, the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both; and if the threat be to cause death or grievous hurt, or to cause the destruction of any property by fire, or to cause an offence punishable with death or imprisonment for life, or with imprisonment for a term which may extend to seven years, or to impute unchastity to a woman, shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.',
 'دھمکی پر دو سال اور موت کی دھمکی پر سات سال تک قید ہو سکتی ہے۔',
 'Criminal', 'Intimidation',
 ARRAY['intimidation','threat','punishment','506','blackmail','dhamki'],
 'Up to 2 years (up to 7 years if death threat) + fine', TRUE, 'Medium'),

('Pakistan Penal Code 1860', 'PPC', '362',
 'Abduction',
 'Whoever by force compels, or by any deceitful means induces, any person to go from any place, is said to abduct that person.',
 'جو کوئی زبردستی یا فریب سے کسی کو کہیں لے جائے وہ اغوا کا مرتکب ہوتا ہے۔',
 'Criminal', 'Kidnapping',
 ARRAY['abduction','kidnapping','aghwa','362','forced'],
 NULL, FALSE, 'High'),

('Pakistan Penal Code 1860', 'PPC', '364',
 'Kidnapping or Abducting in Order to Murder',
 'Whoever kidnaps or abducts any person in order that such person may be murdered or may be so disposed of as to be put in danger of being murdered, shall be punished with imprisonment for life or rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.',
 'قتل کی نیت سے اغوا پر عمر قید یا دس سال سخت قید اور جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Kidnapping',
 ARRAY['kidnapping','murder','abduction','aghwa','364'],
 'Life imprisonment or up to 10 years + fine', FALSE, 'High'),

-- ============================================================
--  CONSTITUTION OF PAKISTAN 1973
-- ============================================================

('Constitution of Pakistan 1973', 'Constitution', 'Article 9',
 'Security of Person',
 'No person shall be deprived of life or liberty save in accordance with law.',
 'کسی شخص کو قانون کے مطابق ہی جان اور آزادی سے محروم کیا جا سکتا ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['life','liberty','security','fundamental rights','article 9','personal freedom','azadi'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 10',
 'Safeguards as to Arrest and Detention',
 'No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest, nor shall he be denied the right to consult and be defended by a legal practitioner of his choice. Every person who is arrested and detained in custody shall be produced before a magistrate within a period of twenty-four hours of such arrest.',
 'گرفتار شخص کو گرفتاری کی وجہ بتانا اور 24 گھنٹے میں مجسٹریٹ کے سامنے پیش کرنا ضروری ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['arrest','detention','custody','24 hours','magistrate','legal counsel','giraftari','article 10'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 10-A',
 'Right to Fair Trial',
 'For the determination of his civil rights and obligations or in any criminal charge against him a person shall be entitled to a fair trial and due process.',
 'ہر شخص کو منصفانہ مقدمے اور قانونی عمل کا حق حاصل ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['fair trial','due process','article 10-A','justice','civil rights','criminal charge','adl'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 14',
 'Inviolability of Dignity of Man',
 'The dignity of man and, subject to law, the privacy of home, shall be inviolable. No person shall be subjected to torture for the purpose of extracting evidence.',
 'انسانی وقار اور گھر کی رازداری محترم ہے۔ تشدد سے ثبوت نہیں لیا جا سکتا۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['dignity','privacy','torture','article 14','human rights','home privacy','waqar'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 15',
 'Freedom of Movement',
 'Every citizen shall have the right to remain in, and subject to any reasonable restriction imposed by law in the public interest, enter and move freely throughout Pakistan and to reside and settle in any part thereof.',
 'ہر شہری کو پاکستان میں آزادانہ نقل و حرکت اور رہائش کا حق ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['freedom of movement','travel','residence','article 15','citizen rights','movement','naqal o harkat'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 17',
 'Freedom of Association',
 'Every citizen shall have the right to form associations or unions, subject to any reasonable restrictions imposed by law in the interest of sovereignty or integrity of Pakistan, public order or morality.',
 'ہر شہری کو انجمنیں یا یونین بنانے کا حق ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['association','union','assembly','article 17','freedom of association','anjuman'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 18',
 'Freedom of Trade, Business or Profession',
 'Every citizen shall have the right to enter upon any lawful profession or occupation, and to conduct any lawful trade or business.',
 'ہر شہری کو جائز پیشہ، تجارت یا کاروبار اختیار کرنے کا حق ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['trade','business','profession','article 18','employment right','tijarat','karobar'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 19',
 'Freedom of Speech',
 'Every citizen shall have the right to freedom of speech and expression, and there shall be freedom of the press, subject to any reasonable restrictions imposed by law in the interest of the glory of Islam or the integrity, security or defence of Pakistan or any part thereof, friendly relations with foreign States, public order, decency or morality, or in relation to contempt of court or commission of or incitement to an offence.',
 'ہر شہری کو آزادی اظہار رائے اور پریس کی آزادی حاصل ہے۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['freedom of speech','expression','press freedom','article 19','speech','azadi e izhar'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 23',
 'Provision as to Property',
 'Every citizen shall have the right to acquire, hold and dispose of property in any part of Pakistan, subject to the Constitution and any reasonable restrictions imposed thereby.',
 'ہر شہری کو پاکستان میں جائیداد حاصل کرنے، رکھنے اور فروخت کرنے کا حق ہے۔',
 'Constitutional', 'Property Rights',
 ARRAY['property','article 23','land','jaidad','property rights','acquisition','dispose'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 24',
 'Protection of Property Rights',
 'No person shall be compulsorily deprived of his property save in accordance with law. No property shall be compulsorily acquired or taken possession of save for a public purpose, and save by the authority of law which provides for compensation therefor.',
 'کسی شخص کو قانون کے بغیر جائیداد سے محروم نہیں کیا جا سکتا۔',
 'Constitutional', 'Property Rights',
 ARRAY['property rights','article 24','acquisition','compensation','public purpose','jaidad','qabza'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 25',
 'Equality of Citizens',
 'All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex alone.',
 'تمام شہری قانون کے سامنے برابر ہیں اور صنف کی بنیاد پر امتیاز نہیں ہوگا۔',
 'Constitutional', 'Fundamental Rights',
 ARRAY['equality','discrimination','article 25','equal rights','gender','women rights','barabri'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 25-A',
 'Right to Education',
 'The State shall provide free and compulsory education to all children of the age of five to sixteen years in such manner as may be determined by law.',
 'ریاست پانچ سے سولہ سال کے تمام بچوں کو مفت اور لازمی تعلیم فراہم کرے گی۔',
 'Constitutional', 'Social Rights',
 ARRAY['education','children','school','article 25-A','taleem','free education','compulsory'],
 NULL, NULL, 'Medium'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 199',
 'Jurisdiction of High Court',
 'Subject to the Constitution, a High Court may, if it is satisfied that no other adequate remedy is provided by law, on the application of any aggrieved party, make an order directing a person performing functions in connection with affairs of the Federation, a Province or a local authority to refrain from doing that which he is not permitted by law to do.',
 'ہائی کورٹ کے پاس بنیادی حقوق کے تحفظ کا اختیار ہے اور وہ کسی بھی ناانصافی کے خلاف احکامات جاری کر سکتی ہے۔',
 'Constitutional', 'Jurisdiction',
 ARRAY['high court','jurisdiction','article 199','writ','mandamus','certiorari','habeas corpus','adalat'],
 NULL, NULL, 'High'),

('Constitution of Pakistan 1973', 'Constitution', 'Article 184(3)',
 'Original Jurisdiction of Supreme Court',
 'Without prejudice to the provisions of Article 199, the Supreme Court shall, if it considers that a question of public importance with reference to the enforcement of any of the Fundamental Rights conferred by Chapter I of Part II is involved, have the power to make an order of the nature mentioned in clause (2) of Article 199.',
 'سپریم کورٹ کو بنیادی حقوق کے تحفظ کے لیے ازخود نوٹس لینے کا اختیار ہے۔',
 'Constitutional', 'Jurisdiction',
 ARRAY['supreme court','article 184','suo motu','fundamental rights','public importance','original jurisdiction'],
 NULL, NULL, 'High'),

-- ============================================================
--  CONTRACT ACT 1872
-- ============================================================

('Contract Act 1872', 'Contract Act', '2(h)',
 'Definition of Contract',
 'An agreement enforceable by law is a contract. A contract must have offer, acceptance, lawful consideration, lawful object, free consent, and parties competent to contract.',
 'قانون کے ذریعے قابل نفاذ معاہدہ "معاہدہ" کہلاتا ہے۔',
 'Civil', 'Contract',
 ARRAY['contract','agreement','معاہدہ','معاملہ','enforceable','contract act','2h'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '10',
 'What Agreements Are Contracts',
 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.',
 'تمام معاہدے جو آزادانہ رضامندی، جائز تحفظ اور جائز مقصد کے ساتھ ہوں، معاہدے ہیں۔',
 'Civil', 'Contract',
 ARRAY['contract','agreement','free consent','lawful','valid contract','section 10'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '14',
 'Free Consent',
 'Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake. Consent so caused is voidable at the option of the party whose consent was so caused.',
 'رضامندی آزادانہ ہو جب وہ جبر، بے جا اثر، فریب، غلط بیانی یا غلطی کے بغیر ہو۔',
 'Civil', 'Contract',
 ARRAY['free consent','coercion','fraud','misrepresentation','voidable','agreement','contract'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '15',
 'Coercion',
 'Coercion is the committing or threatening to commit any act forbidden by the Pakistan Penal Code, or the unlawful detaining or threatening to detain any property, to the prejudice of any person whatever, with the intention of causing any person to enter into an agreement.',
 'جبر سے مراد معاہدے پر مجبور کرنے کے لیے غیر قانونی کام یا دھمکی ہے۔',
 'Civil', 'Contract',
 ARRAY['coercion','jabr','duress','threat','contract void','voidable','section 15'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '16',
 'Undue Influence',
 'A contract is said to be induced by undue influence where the relations subsisting between the parties are such that one of the parties is in a position to dominate the will of the other and uses that position to obtain an unfair advantage over the other.',
 'جب ایک فریق دوسرے پر ناجائز اثر ڈال کر معاہدہ کروائے تو یہ ناجائز اثر ہوتا ہے۔',
 'Civil', 'Contract',
 ARRAY['undue influence','domination','unfair advantage','contract voidable','section 16'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '17',
 'Fraud',
 'Fraud means and includes any of the following acts committed by a party to a contract, or with his connivance, or by his agents, with intent to deceive another party thereto or his agent, or to induce him to enter into the contract: (1) the suggestion as a fact, of that which is not true (2) the active concealment of a fact (3) a promise made without any intention of performing it.',
 'فریب سے مراد دوسرے فریق کو دھوکہ دینے یا معاہدے پر مجبور کرنے کے لیے جھوٹ، چھپاؤ یا جھوٹا وعدہ ہے۔',
 'Civil', 'Fraud',
 ARRAY['fraud','dhoka','deception','misrepresentation','false promise','concealment','section 17'],
 NULL, NULL, 'High'),

('Contract Act 1872', 'Contract Act', '19',
 'Voidability of Agreements Without Free Consent',
 'When consent to an agreement is caused by coercion, fraud, or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused.',
 'جب جبر، فریب یا غلط بیانی سے رضامندی لی جائے تو معاہدہ اس فریق کی مرضی سے کالعدم ہو سکتا ہے۔',
 'Civil', 'Contract',
 ARRAY['voidable','void','coercion','fraud','section 19','invalid contract','consent'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '23',
 'Unlawful Consideration and Object',
 'The consideration or object of an agreement is lawful, unless it is forbidden by law; is of such a nature that, if permitted, it would defeat the provisions of any law; is fraudulent; involves or implies injury to the person or property of another; or the court regards it as immoral, or opposed to public policy.',
 'اگر معاہدے کا مقصد یا تحفظ غیر قانونی ہو تو معاہدہ باطل ہے۔',
 'Civil', 'Contract',
 ARRAY['unlawful','void','illegal contract','public policy','consideration','object','section 23'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '73',
 'Compensation for Loss Caused by Breach of Contract',
 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken it, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.',
 'معاہدہ ٹوٹنے پر نقصان اٹھانے والا فریق معاوضے کا حقدار ہے جو عام طور پر اس خلاف ورزی سے ہو۔',
 'Civil', 'Contract',
 ARRAY['breach of contract','compensation','damages','loss','section 73','معاہدہ خلاف ورزی'],
 NULL, NULL, 'Medium'),

('Contract Act 1872', 'Contract Act', '74',
 'Compensation for Breach Where Penalty Stipulated',
 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
 'اگر معاہدے میں جرمانے کی رقم طے ہو تو خلاف ورزی پر وہی رقم معاوضہ ہوگی۔',
 'Civil', 'Contract',
 ARRAY['penalty','breach','compensation','liquidated damages','section 74','jarimana'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  MUSLIM FAMILY LAWS ORDINANCE 1961 (MFLO)
-- ============================================================

('Muslim Family Laws Ordinance 1961', 'MFLO', 'Section 4',
 'Succession — Orphaned Grandchildren',
 'In the event of the death of any son or daughter of the propositus before the opening of succession, the children of such son or daughter, if any, living at the time the succession opens, shall per stirpes receive a share equivalent to the share which such son or daughter, as the case may be, would have received if alive.',
 'اگر وارث اپنے والد سے پہلے وفات پا جائے تو اس کے بچے اس کے حصے کے حقدار ہوں گے۔',
 'Family', 'Inheritance',
 ARRAY['inheritance','succession','orphan','grandchildren','wirasat','MFLO','section 4'],
 NULL, NULL, 'Medium'),

('Muslim Family Laws Ordinance 1961', 'MFLO', 'Section 6',
 'Polygamy — Restrictions',
 'No man, during the subsistence of an existing marriage, shall except with the previous permission in writing of the Arbitration Council, contract another marriage, nor shall any such marriage contracted without such permission be registered under this Ordinance.',
 'موجودہ نکاح کے دوران دوسرا نکاح آربٹریشن کونسل کی اجازت کے بغیر نہیں ہو سکتا۔',
 'Family', 'Marriage',
 ARRAY['polygamy','second marriage','arbitration council','MFLO','nikah','section 6','permission'],
 'Up to 1 year imprisonment or Rs.5000 fine or both', FALSE, 'Medium'),

('Muslim Family Laws Ordinance 1961', 'MFLO', 'Section 7',
 'Talaq — Procedure',
 'Any man who wishes to divorce his wife shall, as soon as may be after the pronouncement of talaq in any form whatsoever, give the Chairman notice in writing of his having done so, and shall supply a copy thereof to the wife. Talaq, unless revoked earlier, expressly or otherwise, shall not be effective until the expiration of ninety days from the day on which such notice is delivered to the Chairman.',
 'طلاق دینے کے بعد مرد کو آربٹریشن کونسل کو تحریری نوٹس دینا ہوگا اور طلاق نوے دن بعد نافذ ہوگی۔',
 'Family', 'Divorce',
 ARRAY['talaq','divorce','90 days','notice','union council','MFLO','section 7','طلاق'],
 'Up to 1 year imprisonment or Rs.5000 fine (if notice not given)', FALSE, 'High'),

('Muslim Family Laws Ordinance 1961', 'MFLO', 'Section 8',
 'Right of Wife to Divorce — Khul',
 'Where the right to divorce has been duly delegated to the wife and she wishes to exercise that right, or where any of the parties to a marriage wishes to dissolve the marriage otherwise than by talaq, the provisions of Section 7 shall, mutatis mutandis and so far as applicable, apply.',
 'اگر نکاح نامے میں عورت کو طلاق کا حق دیا گیا ہو یا وہ خلع چاہتی ہو تو وہ بھی طلاق کے قانون کے مطابق اقدام کر سکتی ہے۔',
 'Family', 'Divorce',
 ARRAY['khul','khula','divorce by wife','MFLO','section 8','talaq e tafweez','wife divorce right'],
 NULL, FALSE, 'High'),

('Muslim Family Laws Ordinance 1961', 'MFLO', 'Section 9',
 'Maintenance',
 'If any husband fails to maintain his wife adequately, or where there are more wives than one, fails to maintain them equitably, the wife or a wife may apply to the Arbitration Council to determine the matter, and the Arbitration Council may issue a certificate specifying the amount which shall be paid as maintenance by the husband.',
 'اگر شوہر بیوی کا نفقہ ادا نہ کرے تو وہ آربٹریشن کونسل سے نفقے کا تعین کروا سکتی ہے۔',
 'Family', 'Maintenance',
 ARRAY['maintenance','nafaqa','wife rights','husband duty','MFLO','section 9','نفقہ'],
 NULL, FALSE, 'High'),

-- ============================================================
--  DISSOLUTION OF MUSLIM MARRIAGES ACT 1939 (DMMA)
-- ============================================================

('Dissolution of Muslim Marriages Act 1939', 'DMMA', 'Section 2',
 'Grounds for Decree for Dissolution of Marriage',
 'A woman married under Muslim law shall be entitled to obtain a decree for dissolution of marriage on any one or more of the following grounds: (i) whereabouts of husband unknown for four years; (ii) failure to maintain for two years; (iii) husband sentenced to 7 years or more; (iv) impotence; (v) insanity or serious disease; (vi) cruelty including physical and emotional abuse; (vii) any other ground recognised as valid for dissolution of marriage under Muslim law.',
 'مسلمان خاتون شوہر کی گمشدگی، نفقہ نہ ملنے، ظلم و ستم یا دیگر وجوہات پر عدالت سے نکاح فسخ کروا سکتی ہے۔',
 'Family', 'Divorce',
 ARRAY['dissolution','divorce','faskh','DMMA','section 2','cruelty','maintenance failure','wife rights'],
 NULL, FALSE, 'High'),

-- ============================================================
--  GUARDIAN AND WARDS ACT 1890
-- ============================================================

('Guardian and Wards Act 1890', 'GWA', 'Section 17',
 'Matters to Consider in Appointing Guardian',
 'In appointing or declaring the guardian of a minor, the Court shall, subject to the provisions of this section, be guided by what, consistently with the law to which the minor is subject, appears in the circumstances to be for the welfare of the minor. In considering what will be for the welfare of the minor, the Court shall have regard to the age, sex and religion of the minor, the character and capacity of the proposed guardian, the wishes of a deceased parent.',
 'نابالغ بچے کی تحویل میں عدالت بچے کی فلاح و بہبود، عمر، جنس، مذہب اور والدین کی خواہشات کو مدنظر رکھتی ہے۔',
 'Family', 'Custody',
 ARRAY['custody','guardian','child custody','welfare','minor','bachay ki taqseema','section 17','GWA'],
 NULL, NULL, 'High'),

('Guardian and Wards Act 1890', 'GWA', 'Section 25',
 'Title of Father as Natural Guardian',
 'The father is the natural guardian of the person and property of his minor child, but the Court may appoint another person as guardian if the father is found unfit.',
 'باپ نابالغ بچے کا قدرتی سرپرست ہے لیکن عدالت بچے کی بہبود کے لیے کسی اور کو سرپرست مقرر کر سکتی ہے۔',
 'Family', 'Custody',
 ARRAY['father','guardian','natural guardian','custody','minor','section 25'],
 NULL, NULL, 'High'),

-- ============================================================
--  TRANSFER OF PROPERTY ACT 1882 (TPA)
-- ============================================================

('Transfer of Property Act 1882', 'TPA', 'Section 5',
 'Transfer of Property Definition',
 'In the following sections "transfer of property" means an act by which a living person conveys property, in present or in future, to one or more other living persons, or to himself and one or more other living persons. In this section "living person" includes a company or association or body of individuals, whether incorporated or not.',
 'منتقلی جائیداد سے مراد کسی زندہ شخص کا دوسرے زندہ شخص کو جائیداد منتقل کرنا ہے۔',
 'Property', 'Transfer',
 ARRAY['transfer','property','TPA','section 5','jaidad','conveyance','منتقلی'],
 NULL, NULL, 'Medium'),

('Transfer of Property Act 1882', 'TPA', 'Section 54',
 'Sale of Immovable Property',
 'Sale is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised. Such transfer, in the case of tangible immovable property of the value of one hundred rupees and upwards, can be made only by a registered instrument.',
 'فروخت سے مراد قیمت کے عوض ملکیت کی منتقلی ہے اور سو روپے یا زیادہ مالیت کی غیر منقولہ جائیداد رجسٹرڈ دستاویز سے فروخت ہوگی۔',
 'Property', 'Sale',
 ARRAY['sale','property sale','registered deed','ownership transfer','TPA','section 54','bikri','بیع'],
 NULL, NULL, 'High'),

('Transfer of Property Act 1882', 'TPA', 'Section 58',
 'Mortgage Definition',
 'A mortgage is the transfer of an interest in specific immoveable property for the purpose of securing the payment of money advanced or to be advanced by way of loan, an existing or future debt, or the performance of an engagement which may give rise to a pecuniary liability.',
 'رہن سے مراد قرض کی ضمانت کے طور پر مخصوص جائیداد میں حصہ منتقل کرنا ہے۔',
 'Property', 'Mortgage',
 ARRAY['mortgage','rahn','loan security','property mortgage','TPA','section 58','girwi'],
 NULL, NULL, 'High'),

('Transfer of Property Act 1882', 'TPA', 'Section 105',
 'Lease of Immovable Property',
 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee.',
 'اجارہ سے مراد جائیداد کے استعمال کے حق کی مقررہ مدت اور معاوضے کے بدلے منتقلی ہے۔',
 'Property', 'Lease',
 ARRAY['lease','rent','ijara','kiraya','tenant','landlord','TPA','section 105','کرایہ','اجارہ'],
 NULL, NULL, 'Medium'),

('Transfer of Property Act 1882', 'TPA', 'Section 122',
 'Gift Definition',
 'Gift is the transfer of certain existing moveable or immoveable property made voluntarily and without consideration, by one person, called the donor, to another, called the donee, and accepted by or on behalf of the donee.',
 'ہبہ سے مراد بغیر معاوضے کے رضاکارانہ طور پر منقولہ یا غیر منقولہ جائیداد کی منتقلی ہے۔',
 'Property', 'Gift',
 ARRAY['gift','hiba','donation','hibah','TPA','section 122','property gift','ہبہ'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  CODE OF CRIMINAL PROCEDURE 1898 (CrPC)
-- ============================================================

('Code of Criminal Procedure 1898', 'CrPC', 'Section 154',
 'First Information Report (FIR)',
 'Every information relating to the commission of a cognizable offence if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant; and every such information, whether given in writing or reduced to writing as aforesaid, shall be signed by the person giving it. The substance of the information shall be entered in a book to be kept by such officer.',
 'ایف آئی آر ہر قابل علم جرم کی اطلاع ہے جو پولیس اسٹیشن میں درج کروائی جاتی ہے اور تحریری شکل میں ہوتی ہے۔',
 'Criminal', 'Procedure',
 ARRAY['FIR','first information report','police report','section 154','CrPC','درخواست','تھانہ'],
 NULL, NULL, 'High'),

('Code of Criminal Procedure 1898', 'CrPC', 'Section 496',
 'Bail in Bailable Offences',
 'When any person other than a person accused of a non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court, and is prepared at any time while in custody of such officer or at any stage of proceedings before such Court to give bail, such person shall be released on bail.',
 'ضمانتی جرائم میں گرفتار شخص کو ضمانت پر رہا کیا جائے گا اگر وہ ضمانت دینے کے لیے تیار ہو۔',
 'Criminal', 'Bail',
 ARRAY['bail','zamaanat','bailable','release','section 496','CrPC','ضمانت'],
 NULL, NULL, 'High'),

('Code of Criminal Procedure 1898', 'CrPC', 'Section 497',
 'Bail in Non-Bailable Offences',
 'When any person accused of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station, or appears or is brought before a Court, he may be released on bail, but shall not be so released if there appear reasonable grounds for believing that he has been guilty of an offence punishable with death or transportation for life.',
 'غیر ضمانتی جرائم میں عدالت کی صوابدید پر ضمانت مل سکتی ہے سوائے موت یا عمر قید کی سزا کے جرائم کے۔',
 'Criminal', 'Bail',
 ARRAY['bail','non-bailable','section 497','CrPC','serious offence','court bail','ضمانت'],
 NULL, NULL, 'High'),

('Code of Criminal Procedure 1898', 'CrPC', 'Section 22-A',
 'Powers of Justice of Peace',
 'A Justice of the Peace shall have powers to direct the police to register a criminal case if the police refuses to do so, for the inspection of police stations and for giving directions to maintain peace and order in the area.',
 'جسٹس آف پیس کو پولیس کو مقدمہ درج کرنے کا حکم دینے اور امن و امان برقرار رکھنے کے اختیارات حاصل ہیں۔',
 'Criminal', 'Procedure',
 ARRAY['justice of peace','22-A','FIR refused','police','section 22A','CrPC','maqadma darj'],
 NULL, NULL, 'High'),

-- ============================================================
--  INDUSTRIAL & COMMERCIAL EMPLOYMENT ORDINANCE 1968 (ICEO)
-- ============================================================

('Industrial & Commercial Employment Ordinance 1968', 'ICEO', 'Section 11',
 'Termination of Employment',
 'No employer shall terminate the employment of a workman who has been in his continuous employment for a period of three months or more, except for a reasonable cause and after giving him notice of thirty days or pay in lieu thereof.',
 'تین ماہ یا اس سے زیادہ عرصے سے ملازم کارکن کو 30 دن کا نوٹس یا تنخواہ دیے بغیر برطرف نہیں کیا جا سکتا۔',
 'Labor', 'Employment',
 ARRAY['termination','job','naukri','notice period','ICEO','employment','section 11','برطرفی','نوکری'],
 NULL, NULL, 'High'),

('Industrial & Commercial Employment Ordinance 1968', 'ICEO', 'Section 12',
 'Retrenchment',
 'No workman employed in any establishment to which this Ordinance applies who has been in continuous employment for not less than one year shall be retrenched by the employer until the employer has given three months notice in writing to the concerned workman and has paid him retrenchment compensation equivalent to thirty days wages for every completed year of service or any part thereof.',
 'ایک سال سے زیادہ ملازم کارکن کی برطرفی پر 3 ماہ کا نوٹس اور فی سال خدمت ایک ماہ کی تنخواہ بطور معاوضہ ضروری ہے۔',
 'Labor', 'Employment',
 ARRAY['retrenchment','layoff','job loss','compensation','ICEO','section 12','severance','takhfeef e ikhrajaat'],
 NULL, NULL, 'High'),

('Industrial & Commercial Employment Ordinance 1968', 'ICEO', 'Section 17',
 'Gratuity',
 'Every workman employed in an establishment who has completed not less than five years of continuous service therein shall, on the termination of his employment whether on superannuation, retirement, resignation, discharge, or death, be paid by the employer a gratuity at the rate of thirty days wages for every completed year of service.',
 'پانچ سال یا زیادہ خدمت کے بعد ملازمت ختم ہونے پر فی سال 30 دن کی تنخواہ بطور گریجویٹی ملے گی۔',
 'Labor', 'Employment',
 ARRAY['gratuity','end of service','retirement','resignation','ICEO','section 17','gratuity payment','طویل خدمت'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  PAYMENT OF WAGES ACT 1936
-- ============================================================

('Payment of Wages Act 1936', 'PWA', 'Section 3',
 'Responsibility for Payment of Wages',
 'Every employer shall be responsible for the payment of all wages required to be paid under this Act to persons employed by him and shall fix the wage periods, which shall not exceed one month.',
 'ہر آجر اپنے ملازمین کی تنخواہ ادا کرنے کا ذمہ دار ہے اور تنخواہ کا وقفہ ایک ماہ سے زیادہ نہیں ہوگا۔',
 'Labor', 'Wages',
 ARRAY['wages','salary','payment','employer duty','PWA','section 3','تنخواہ','mazdoori'],
 NULL, NULL, 'Medium'),

('Payment of Wages Act 1936', 'PWA', 'Section 4',
 'Time of Payment of Wages',
 'The wages of every person employed in an establishment shall be paid before the expiry of the seventh day after the last day of the wage period for which wages are payable, or in the case of establishments employing more than one thousand persons, before the expiry of the tenth day after such last day.',
 'تنخواہ ماہانہ مدت ختم ہونے کے سات دن کے اندر اور ہزار سے زیادہ ملازمین والے اداروں میں دس دن کے اندر ادا ہونی چاہیے۔',
 'Labor', 'Wages',
 ARRAY['wages','salary deadline','section 4','PWA','delayed salary','تنخواہ تاخیر'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  RENT RESTRICTION ORDINANCES (General Pakistani Rent Law)
-- ============================================================

('Rent Restriction Ordinance (General)', 'Rent Law', 'General Provision 1',
 'Tenant Protection — Eviction',
 'A landlord cannot evict a tenant without valid legal ground. Valid grounds include: non-payment of rent for two months or more; sub-letting without permission; using premises for purposes other than agreed; causing structural damage. Proper legal notice must be served before eviction proceedings.',
 'مالک مکان قانونی وجہ کے بغیر کرایہ دار کو نہیں نکال سکتا۔ دو ماہ کرایہ نہ دینا، بغیر اجازت سب لیٹ کرنا یا مکان کو نقصان پہنچانا قانونی وجوہات ہیں۔',
 'Property', 'Rent',
 ARRAY['eviction','tenant','landlord','kiraya','makan','rent','nikalna','kiraya dar','maalik makaan'],
 NULL, NULL, 'High'),

('Rent Restriction Ordinance (General)', 'Rent Law', 'General Provision 2',
 'Rent Increase Restrictions',
 'A landlord cannot increase rent arbitrarily. Any rent increase must comply with provincial rent restriction laws. Typically, notice must be given before increasing rent and the tenant has the right to contest unreasonable increases before the Rent Controller.',
 'مالک مکان من مانے طریقے سے کرایہ نہیں بڑھا سکتا۔ کرایہ بڑھانے سے پہلے نوٹس دینا ضروری ہے اور کرایہ دار رینٹ کنٹرولر کے پاس جا سکتا ہے۔',
 'Property', 'Rent',
 ARRAY['rent increase','kiraya izafa','rent controller','tenant rights','landlord','notice','مالک مکان','کرایہ'],
 NULL, NULL, 'Medium'),

('Rent Restriction Ordinance (General)', 'Rent Law', 'General Provision 3',
 'Rent Agreement and Deposit',
 'A written rent agreement is strongly recommended and should include: monthly rent amount, security deposit (typically 2 months), duration of tenancy, maintenance responsibilities, and grounds for termination. Security deposit must be returned upon vacating unless lawful deductions apply.',
 'تحریری کرایہ معاہدہ ضروری ہے جس میں ماہانہ کرایہ، سیکیورٹی ڈپازٹ، مدت اور ذمہ داریاں درج ہوں۔ مکان خالی کرنے پر ڈپازٹ واپس کرنا ضروری ہے۔',
 'Property', 'Rent',
 ARRAY['rent agreement','kiraya namaa','security deposit','tenant','landlord','rent contract','agreement','ڈپازٹ'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  NATIONAL ACCOUNTABILITY BUREAU ORDINANCE 1999 (NAB)
-- ============================================================

('National Accountability Bureau Ordinance 1999', 'NAB', 'Section 9',
 'Offences of Corruption and Corrupt Practices',
 'A holder of a public office, or any other person, is said to commit or to have committed the offence of corruption and corrupt practices if he accepts or obtains from any person any gratification other than legal remuneration for doing or forbearing to do any official act; or if he, by corrupt or illegal means, obtains from the Government or any other person any property, award, or benefit for himself or his nominee.',
 'سرکاری عہدہ دار یا کوئی بھی شخص جو رشوت لے یا ناجائز ذرائع سے فائدہ اٹھائے وہ کرپشن کا مرتکب ہوتا ہے۔',
 'Criminal', 'Corruption',
 ARRAY['corruption','bribery','NAB','section 9','public office','corrupt practices','rishwat','کرپشن'],
 'Up to 14 years imprisonment + recovery of assets', FALSE, 'High'),

-- ============================================================
--  PREVENTION OF ELECTRONIC CRIMES ACT 2016 (PECA)
-- ============================================================

('Prevention of Electronic Crimes Act 2016', 'PECA', 'Section 20',
 'Offences Against Dignity of Natural Person',
 'Whoever intentionally and publicly exhibits, displays, transmits, makes available, broadcasts or shares, any information through any information system, which he knows or has reason to believe to be false, and intimidates or harms the reputation or privacy of a natural person, shall be punished with imprisonment for a term which may extend to three years or with fine which may extend to one million rupees, or with both.',
 'جو کوئی جھوٹی معلومات سوشل میڈیا یا آن لائن شیئر کرے جو کسی کی ساکھ یا پرائیویسی کو نقصان پہنچائے اسے تین سال قید یا دس لاکھ روپے جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Cyber Crime',
 ARRAY['PECA','cybercrime','section 20','online harassment','defamation','social media','fake news','dignity','آن لائن ہراسانی'],
 'Up to 3 years imprisonment or Rs.1 million fine or both', FALSE, 'High'),

('Prevention of Electronic Crimes Act 2016', 'PECA', 'Section 21',
 'Cyber Stalking',
 'Whoever commits the offence of cyber stalking shall be punished with imprisonment for a term which may extend to three years or with fine which may extend to one million rupees or with both. A person commits the offence of cyber stalking who, with the intent to coerce, intimidate, or harass any person, uses information system to follow, contact, or attempt to contact any person.',
 'سائبر اسٹاکنگ پر تین سال قید یا دس لاکھ روپے جرمانہ یا دونوں ہو سکتے ہیں۔',
 'Criminal', 'Cyber Crime',
 ARRAY['cyber stalking','online harassment','PECA','section 21','intimidation','harass','سائبر ہراسانی'],
 'Up to 3 years imprisonment or Rs.1 million fine or both', FALSE, 'High'),

('Prevention of Electronic Crimes Act 2016', 'PECA', 'Section 26',
 'Spamming',
 'Whoever transmits harmful, fraudulent, misleading, illegal, or unsolicited information to any person without permission of the recipient or causes any information system to show any such information for wrongful gain shall be punished with imprisonment of either description for a term which may extend to three months or with fine which may extend to fifty thousand rupees, or with both.',
 'غیر مطلوبہ یا گمراہ کن پیغامات بھیجنے پر تین ماہ قید یا پچاس ہزار روپے جرمانہ ہو سکتا ہے۔',
 'Criminal', 'Cyber Crime',
 ARRAY['spam','PECA','section 26','unsolicited message','fraud email','scam message'],
 'Up to 3 months or Rs.50,000 fine or both', TRUE, 'Low'),

-- ============================================================
--  COMPANIES ACT 2017
-- ============================================================

('Companies Act 2017', 'Companies Act', 'Section 17',
 'Incorporation of Company',
 'Any person or association of persons may, for any lawful purpose, form an incorporated company by subscribing their names to a memorandum of association and complying with the requirements of this Act in respect of registration.',
 'کوئی بھی شخص یا اشخاص کا گروہ قانونی مقصد کے لیے یادداشت انجمن پر دستخط کر کے کمپنی قائم کر سکتا ہے۔',
 'Civil', 'Corporate',
 ARRAY['company registration','incorporation','SECP','Companies Act','section 17','business setup','company','کمپنی'],
 NULL, NULL, 'Medium'),

-- ============================================================
--  CONSUMER PROTECTION ACT (Provincial — General Principles)
-- ============================================================

('Consumer Protection Act (General)', 'CPA', 'General Provision 1',
 'Consumer Rights — Defective Goods',
 'A consumer has the right to claim refund, replacement, or compensation for any defective goods or substandard services received. The seller or service provider is liable for defects that were present at the time of sale. The consumer may file a complaint before the Consumer Court or Consumer Protection Council.',
 'صارف کو خراب یا ناقص سامان یا خدمات پر واپسی، تبدیلی یا معاوضے کا حق ہے۔ شکایت کنزیومر کورٹ میں دائر کی جا سکتی ہے۔',
 'Consumer', 'Consumer Rights',
 ARRAY['consumer','defective','refund','complaint','consumer court','CPA','kharab maal','صارف'],
 NULL, NULL, 'Medium'),

('Consumer Protection Act (General)', 'CPA', 'General Provision 2',
 'Consumer Rights — Services',
 'A consumer is entitled to receive services of the standard and quality as promised or as reasonably expected. If a service provider fails to deliver the promised service, the consumer may claim compensation for actual losses. Misleading advertisements creating false expectations are prohibited.',
 'صارف کو وعدے کے مطابق خدمات حاصل کرنے کا حق ہے۔ گمراہ کن اشتہارات پر پابندی ہے اور نقصان کا معاوضہ مل سکتا ہے۔',
 'Consumer', 'Consumer Rights',
 ARRAY['services','consumer','misleading advertisement','compensation','CPA','consumer rights','خدمات'],
 NULL, NULL, 'Medium');

-- Final count verification
SELECT category, COUNT(*) as total FROM laws GROUP BY category ORDER BY total DESC;
