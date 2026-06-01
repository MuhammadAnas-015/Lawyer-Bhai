"""
NLP Laws Engine — keyword + TF-IDF matching against Pakistani law database.
No paid API needed. Runs 100% locally.
"""
import re
import sqlite3
import json
from typing import List, Dict, Tuple

DB_PATH = "laws.db"

# ─────────────────────────────────────────────
#  Pakistani Laws Data
# ─────────────────────────────────────────────
from laws_extended import EXTENDED_LAWS

LAWS_DATA = [
    # ── PPC ──
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"299","title":"Definitions — Offences Relating to Human Body","text":"Qatl-e-Amd means the intentional killing of a person by doing an act with the intention of causing death or with the intention of causing bodily harm likely to cause death.","category":"Criminal","sub":"Murder","keywords":["murder","qatl","qatl-e-amd","killing","death","intentional","qisas"],"punishment":None,"bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"302","title":"Punishment for Qatl-e-Amd (Murder)","text":"Whoever commits qatl-e-amd shall be punished with death as qisas; or imprisoned for life or imprisonment for a term which may extend to twenty-five years as tazir.","category":"Criminal","sub":"Murder","keywords":["murder","qatl","302","death penalty","life imprisonment","qisas","tazir","intentional killing"],"punishment":"Death (Qisas) or Life Imprisonment (Tazir)","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"304","title":"Punishment for Qatl Shibh-e-Amd","text":"Whoever commits qatl shibh-e-amd shall be punished with diyat and may also be punished with imprisonment of either description for a term which may extend to fourteen years as tazir.","category":"Criminal","sub":"Murder","keywords":["qatl","shbh-e-amd","diyat","manslaughter","unintentional killing"],"punishment":"Diyat + up to 14 years","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"354","title":"Assault or Criminal Force to Woman with Intent to Outrage Modesty","text":"Whoever assaults or uses criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.","category":"Criminal","sub":"Assault","keywords":["assault","woman","modesty","outrage","harassment","sexual harassment","eve teasing","tazkiya"],"punishment":"Up to 2 years or fine or both","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"376","title":"Punishment for Rape (Zina-bil-Jabr)","text":"Whoever commits rape shall be punished with death or imprisonment of either description for a term which shall not be less than ten years or more than twenty-five years and shall also be liable to fine.","category":"Criminal","sub":"Sexual Violence","keywords":["rape","zina-bil-jabr","sexual assault","violence against women","376"],"punishment":"Death or 10 to 25 years + fine","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"379","title":"Punishment for Theft","text":"Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.","category":"Criminal","sub":"Theft","keywords":["theft","chori","stealing","snatch","pick pocket","379","chorya"],"punishment":"Up to 3 years or fine or both","bailable":False,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"392","title":"Punishment for Robbery","text":"Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years.","category":"Criminal","sub":"Robbery","keywords":["robbery","lootkhasoot","dacoity","snatching","armed robbery","392","loot"],"punishment":"Up to 10 years + fine","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"395","title":"Punishment for Dacoity","text":"Whoever commits dacoity shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.","category":"Criminal","sub":"Robbery","keywords":["dacoity","daka","gang robbery","armed gang","395"],"punishment":"Life or up to 10 years + fine","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"406","title":"Punishment for Criminal Breach of Trust","text":"Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.","category":"Criminal","sub":"Fraud","keywords":["breach of trust","amanat","khiyanat","embezzlement","misappropriation","fraud","406","trust"],"punishment":"Up to 7 years or fine or both","bailable":False,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"420","title":"Cheating and Dishonestly Inducing Delivery of Property","text":"Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.","category":"Criminal","sub":"Fraud","keywords":["cheating","fraud","dhoka","deception","420","property fraud","scam","con","cheating"],"punishment":"Up to 7 years + fine","bailable":False,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"441","title":"Criminal Trespass","text":"Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property, commits criminal trespass.","category":"Criminal","sub":"Trespass","keywords":["trespass","ghar dakhal","property invasion","unauthorized entry","441","qabza"],"punishment":"Up to 3 months or Rs.500 fine","bailable":True,"severity":"Low"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"420","title":"Criminal Trespass Punishment","text":"Whoever commits criminal trespass shall be punished with imprisonment of either description for a term which may extend to three months.","category":"Criminal","sub":"Trespass","keywords":["trespass","punishment","criminal trespass","447","dakhal"],"punishment":"Up to 3 months or Rs.500 fine","bailable":True,"severity":"Low"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"448","title":"Punishment for House Trespass","text":"Whoever commits house-trespass shall be punished with imprisonment of either description for a term which may extend to one year, or with fine which may extend to one thousand rupees, or with both.","category":"Criminal","sub":"Trespass","keywords":["house trespass","ghar mein dakhal","home invasion","448","ghar"],"punishment":"Up to 1 year or Rs.1000 fine","bailable":True,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"499","title":"Defamation","text":"Whoever makes or publishes any imputation concerning any person intending to harm the reputation of such person, is said to defame that person.","category":"Criminal","sub":"Defamation","keywords":["defamation","slander","libel","badnami","reputation","hatk izzat","499"],"punishment":"Up to 2 years or fine","bailable":True,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"503","title":"Criminal Intimidation","text":"Whoever threatens another with any injury to his person, reputation or property, with intent to cause alarm to that person, commits criminal intimidation.","category":"Criminal","sub":"Intimidation","keywords":["threat","intimidation","dhamki","blackmail","extortion","503","dara"],"punishment":"Up to 2 years or fine","bailable":True,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"506","title":"Punishment for Criminal Intimidation","text":"Whoever commits criminal intimidation shall be punished with imprisonment for a term which may extend to two years, or with fine, or with both; and if the threat be to cause death, seven years imprisonment.","category":"Criminal","sub":"Intimidation","keywords":["intimidation","threat","punishment","506","blackmail","dhamki","death threat"],"punishment":"Up to 2 years (7 years if death threat)","bailable":True,"severity":"Medium"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"362","title":"Abduction","text":"Whoever by force compels, or by any deceitful means induces, any person to go from any place, is said to abduct that person.","category":"Criminal","sub":"Kidnapping","keywords":["abduction","kidnapping","aghwa","362","forced","apaharan"],"punishment":"Varies by purpose","bailable":False,"severity":"High"},
    {"act":"Pakistan Penal Code 1860","short":"PPC","sec":"364","title":"Kidnapping or Abducting in Order to Murder","text":"Whoever kidnaps or abducts any person in order that such person may be murdered shall be punished with imprisonment for life or rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.","category":"Criminal","sub":"Kidnapping","keywords":["kidnapping","murder","abduction","aghwa","364","kidnap"],"punishment":"Life or up to 10 years + fine","bailable":False,"severity":"High"},

    # ── CONSTITUTION ──
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 9","title":"Security of Person","text":"No person shall be deprived of life or liberty save in accordance with law.","category":"Constitutional","sub":"Fundamental Rights","keywords":["life","liberty","security","fundamental rights","article 9","personal freedom","azadi","zindagi"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 10","title":"Safeguards as to Arrest and Detention","text":"No person who is arrested shall be detained in custody without being informed of the grounds for such arrest. Every person who is arrested shall be produced before a magistrate within a period of twenty-four hours of such arrest.","category":"Constitutional","sub":"Fundamental Rights","keywords":["arrest","detention","custody","24 hours","magistrate","legal counsel","giraftari","article 10","girftaar"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 10-A","title":"Right to Fair Trial","text":"For the determination of his civil rights and obligations or in any criminal charge against him a person shall be entitled to a fair trial and due process.","category":"Constitutional","sub":"Fundamental Rights","keywords":["fair trial","due process","article 10-A","justice","civil rights","criminal charge","adl","insaf"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 14","title":"Inviolability of Dignity of Man","text":"The dignity of man and, subject to law, the privacy of home, shall be inviolable. No person shall be subjected to torture for the purpose of extracting evidence.","category":"Constitutional","sub":"Fundamental Rights","keywords":["dignity","privacy","torture","article 14","human rights","home privacy","waqar","izzat"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 19","title":"Freedom of Speech","text":"Every citizen shall have the right to freedom of speech and expression, and there shall be freedom of the press, subject to any reasonable restrictions imposed by law.","category":"Constitutional","sub":"Fundamental Rights","keywords":["freedom of speech","expression","press freedom","article 19","speech","azadi e izhar","baat"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 23","title":"Provision as to Property","text":"Every citizen shall have the right to acquire, hold and dispose of property in any part of Pakistan, subject to the Constitution and any reasonable restrictions imposed thereby.","category":"Constitutional","sub":"Property Rights","keywords":["property","article 23","land","jaidad","property rights","acquisition","dispose","zameen"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 24","title":"Protection of Property Rights","text":"No person shall be compulsorily deprived of his property save in accordance with law. No property shall be compulsorily acquired save for a public purpose and save by the authority of law which provides for compensation therefor.","category":"Constitutional","sub":"Property Rights","keywords":["property rights","article 24","acquisition","compensation","public purpose","jaidad","qabza","dispossess"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 25","title":"Equality of Citizens","text":"All citizens are equal before law and are entitled to equal protection of law. There shall be no discrimination on the basis of sex alone.","category":"Constitutional","sub":"Fundamental Rights","keywords":["equality","discrimination","article 25","equal rights","gender","women rights","barabri","farq"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 199","title":"Jurisdiction of High Court","text":"A High Court may make an order directing a person performing functions in connection with affairs of the Federation or a Province to refrain from doing that which he is not permitted by law to do. Habeas corpus, mandamus, certiorari writs can be issued.","category":"Constitutional","sub":"Jurisdiction","keywords":["high court","jurisdiction","article 199","writ","mandamus","certiorari","habeas corpus","adalat","court"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Constitution of Pakistan 1973","short":"Constitution","sec":"Article 184(3)","title":"Original Jurisdiction of Supreme Court","text":"The Supreme Court shall have the power to make an order for the enforcement of Fundamental Rights if it considers that a question of public importance is involved. The court can take suo motu notice.","category":"Constitutional","sub":"Jurisdiction","keywords":["supreme court","article 184","suo motu","fundamental rights","public importance","original jurisdiction"],"punishment":None,"bailable":None,"severity":"High"},

    # ── CONTRACT ACT ──
    {"act":"Contract Act 1872","short":"Contract Act","sec":"2(h)","title":"Definition of Contract","text":"An agreement enforceable by law is a contract. A contract must have offer, acceptance, lawful consideration, lawful object, free consent, and parties competent to contract.","category":"Civil","sub":"Contract","keywords":["contract","agreement","معاہدہ","enforceable","contract act","valid","deal"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Contract Act 1872","short":"Contract Act","sec":"14","title":"Free Consent","text":"Consent is said to be free when it is not caused by coercion, undue influence, fraud, misrepresentation, or mistake. Consent so caused is voidable at the option of the party whose consent was so caused.","category":"Civil","sub":"Contract","keywords":["free consent","coercion","fraud","misrepresentation","voidable","agreement","contract","consent"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Contract Act 1872","short":"Contract Act","sec":"17","title":"Fraud in Contract","text":"Fraud means any act committed by a party to a contract with intent to deceive another party: false suggestion of facts, active concealment of facts, a promise made without intention of performing it.","category":"Civil","sub":"Fraud","keywords":["fraud","dhoka","deception","misrepresentation","false promise","concealment","section 17","contract fraud"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Contract Act 1872","short":"Contract Act","sec":"19","title":"Voidability of Agreements Without Free Consent","text":"When consent to an agreement is caused by coercion, fraud, or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused.","category":"Civil","sub":"Contract","keywords":["voidable","void","coercion","fraud","section 19","invalid contract","consent","cancel"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Contract Act 1872","short":"Contract Act","sec":"73","title":"Compensation for Loss Caused by Breach of Contract","text":"When a contract has been broken, the party who suffers by such breach is entitled to receive from the party who has broken it, compensation for any loss or damage caused to him thereby which naturally arose in the usual course of things from such breach.","category":"Civil","sub":"Contract","keywords":["breach of contract","compensation","damages","loss","section 73","معاہدہ خلاف ورزی","violation","not fulfilled"],"punishment":None,"bailable":None,"severity":"Medium"},

    # ── FAMILY LAWS ──
    {"act":"Muslim Family Laws Ordinance 1961","short":"MFLO","sec":"Section 6","title":"Polygamy — Restrictions","text":"No man, during the subsistence of an existing marriage, shall except with the previous permission in writing of the Arbitration Council, contract another marriage.","category":"Family","sub":"Marriage","keywords":["polygamy","second marriage","arbitration council","MFLO","nikah","section 6","dusra nikah","shadi"],"punishment":"Up to 1 year or Rs.5000 fine","bailable":False,"severity":"Medium"},
    {"act":"Muslim Family Laws Ordinance 1961","short":"MFLO","sec":"Section 7","title":"Talaq — Procedure","text":"Any man who wishes to divorce his wife shall give the Chairman notice in writing of his having done so. Talaq shall not be effective until the expiration of ninety days from the day on which such notice is delivered to the Chairman.","category":"Family","sub":"Divorce","keywords":["talaq","divorce","90 days","notice","union council","MFLO","section 7","طلاق","alag","talaaq"],"punishment":"Up to 1 year or Rs.5000 fine if notice not given","bailable":False,"severity":"High"},
    {"act":"Muslim Family Laws Ordinance 1961","short":"MFLO","sec":"Section 8","title":"Right of Wife to Divorce — Khul","text":"Where the right to divorce has been duly delegated to the wife and she wishes to exercise that right, or where any of the parties to a marriage wishes to dissolve the marriage by khul, the provisions of Section 7 shall apply.","category":"Family","sub":"Divorce","keywords":["khul","khula","divorce by wife","MFLO","section 8","talaq e tafweez","wife divorce right","aurat divorce"],"punishment":None,"bailable":False,"severity":"High"},
    {"act":"Muslim Family Laws Ordinance 1961","short":"MFLO","sec":"Section 9","title":"Maintenance (Nafaqa)","text":"If any husband fails to maintain his wife adequately, the wife may apply to the Arbitration Council to determine the matter, and the Arbitration Council may issue a certificate specifying the amount which shall be paid as maintenance by the husband.","category":"Family","sub":"Maintenance","keywords":["maintenance","nafaqa","wife rights","husband duty","MFLO","section 9","نفقہ","kharch","allowance"],"punishment":None,"bailable":False,"severity":"High"},
    {"act":"Dissolution of Muslim Marriages Act 1939","short":"DMMA","sec":"Section 2","title":"Grounds for Dissolution of Marriage","text":"A woman married under Muslim law shall be entitled to obtain a decree for dissolution of marriage on grounds including: husband whereabouts unknown for four years; failure to maintain for two years; husband sentenced to 7+ years; cruelty including physical and emotional abuse.","category":"Family","sub":"Divorce","keywords":["dissolution","divorce","faskh","DMMA","section 2","cruelty","maintenance failure","wife rights","khuwa","zulm"],"punishment":None,"bailable":False,"severity":"High"},
    {"act":"Guardian and Wards Act 1890","short":"GWA","sec":"Section 17","title":"Child Custody — Welfare Principle","text":"In appointing or declaring the guardian of a minor, the Court shall be guided by what appears to be for the welfare of the minor, having regard to the age, sex and religion of the minor, the character and capacity of the proposed guardian.","category":"Family","sub":"Custody","keywords":["custody","guardian","child custody","welfare","minor","bachay ki taqseema","section 17","GWA","baccha"],"punishment":None,"bailable":None,"severity":"High"},

    # ── PROPERTY ──
    {"act":"Transfer of Property Act 1882","short":"TPA","sec":"Section 54","title":"Sale of Immovable Property","text":"Sale is a transfer of ownership in exchange for a price paid or promised. Transfer of tangible immovable property of the value of one hundred rupees and upwards can be made only by a registered instrument.","category":"Property","sub":"Sale","keywords":["sale","property sale","registered deed","ownership transfer","TPA","section 54","bikri","بیع","sell","buy"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Transfer of Property Act 1882","short":"TPA","sec":"Section 58","title":"Mortgage Definition","text":"A mortgage is the transfer of an interest in specific immoveable property for the purpose of securing the payment of money advanced by way of loan or an existing debt.","category":"Property","sub":"Mortgage","keywords":["mortgage","rahn","loan security","property mortgage","TPA","section 58","girwi","pledge","loan"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Transfer of Property Act 1882","short":"TPA","sec":"Section 105","title":"Lease of Immovable Property","text":"A lease of immovable property is a transfer of a right to enjoy such property for a certain time in consideration of a price paid periodically, called rent.","category":"Property","sub":"Lease","keywords":["lease","rent","ijara","kiraya","tenant","landlord","TPA","section 105","کرایہ","اجارہ","makan","house"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Transfer of Property Act 1882","short":"TPA","sec":"Section 122","title":"Gift (Hiba)","text":"Gift is the transfer of certain existing moveable or immoveable property made voluntarily and without consideration by one person to another, and accepted by or on behalf of the donee.","category":"Property","sub":"Gift","keywords":["gift","hiba","donation","hibah","TPA","section 122","property gift","ہبہ","tuhfa"],"punishment":None,"bailable":None,"severity":"Medium"},

    # ── RENT LAW ──
    {"act":"Rent Restriction Ordinance","short":"Rent Law","sec":"General 1","title":"Tenant Protection — Eviction","text":"A landlord cannot evict a tenant without valid legal ground. Valid grounds include: non-payment of rent for two months or more; sub-letting without permission; causing structural damage. Proper legal notice must be served before eviction proceedings.","category":"Property","sub":"Rent","keywords":["eviction","tenant","landlord","kiraya","makan","rent","nikalna","kiraya dar","maalik makaan","ghar se nikaalna"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Rent Restriction Ordinance","short":"Rent Law","sec":"General 2","title":"Rent Increase Restrictions","text":"A landlord cannot increase rent arbitrarily. Any rent increase must comply with provincial rent restriction laws. Typically notice must be given and the tenant has the right to contest unreasonable increases before the Rent Controller.","category":"Property","sub":"Rent","keywords":["rent increase","kiraya izafa","rent controller","tenant rights","landlord","notice","مالک مکان","کرایہ","izafa"],"punishment":None,"bailable":None,"severity":"Medium"},

    # ── LABOR ──
    {"act":"Industrial & Commercial Employment Ordinance 1968","short":"ICEO","sec":"Section 11","title":"Termination of Employment","text":"No employer shall terminate the employment of a workman who has been in his continuous employment for a period of three months or more, except for a reasonable cause and after giving him notice of thirty days or pay in lieu thereof.","category":"Labor","sub":"Employment","keywords":["termination","job","naukri","notice period","ICEO","employment","section 11","bartarfi","nokri","fired","remove","dismiss","nikaal","nikaala","nikaalna","employer","employee","mulazim","mulazmat","bina notice","without notice","illegally fired","wrongful termination"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Industrial & Commercial Employment Ordinance 1968","short":"ICEO","sec":"Section 12","title":"Retrenchment Compensation","text":"No workman employed for not less than one year shall be retrenched until the employer has given three months notice in writing and has paid retrenchment compensation equivalent to thirty days wages for every completed year of service.","category":"Labor","sub":"Employment","keywords":["retrenchment","layoff","job loss","compensation","ICEO","section 12","severance","takhfeef","redundancy"],"punishment":None,"bailable":None,"severity":"High"},
    {"act":"Industrial & Commercial Employment Ordinance 1968","short":"ICEO","sec":"Section 17","title":"Gratuity","text":"Every workman who has completed not less than five years of continuous service shall, on the termination of his employment whether on superannuation, retirement, resignation, discharge, or death, be paid a gratuity at the rate of thirty days wages for every completed year of service.","category":"Labor","sub":"Employment","keywords":["gratuity","end of service","retirement","resignation","ICEO","section 17","gratuity payment","pension","salary end"],"punishment":None,"bailable":None,"severity":"Medium"},
    {"act":"Payment of Wages Act 1936","short":"PWA","sec":"Section 4","title":"Time of Payment of Wages","text":"The wages of every person employed in an establishment shall be paid before the expiry of the seventh day after the last day of the wage period, or in larger establishments the tenth day.","category":"Labor","sub":"Wages","keywords":["wages","salary deadline","section 4","PWA","delayed salary","salary","mazdoori","pay","tanazkha","tankhwa","salary nahi mili","salary rok li","unpaid","salary withheld","payment","employer","nahi de raha"],"punishment":None,"bailable":None,"severity":"Medium"},

    # ── CYBER CRIMES ──
    {"act":"Prevention of Electronic Crimes Act 2016","short":"PECA","sec":"Section 20","title":"Offences Against Dignity of Natural Person","text":"Whoever intentionally and publicly exhibits or transmits any information through any information system which he knows to be false, and intimidates or harms the reputation or privacy of a natural person, shall be punished with imprisonment for a term which may extend to three years or with fine which may extend to one million rupees.","category":"Criminal","sub":"Cyber Crime","keywords":["PECA","cybercrime","section 20","online harassment","defamation","social media","fake news","dignity","آن لائن ہراسانی","online","internet"],"punishment":"Up to 3 years or Rs.1 million fine","bailable":False,"severity":"High"},
    {"act":"Prevention of Electronic Crimes Act 2016","short":"PECA","sec":"Section 21","title":"Cyber Stalking","text":"A person commits the offence of cyber stalking who, with the intent to coerce, intimidate, or harass any person, uses information system to follow, contact, or attempt to contact any person repeatedly.","category":"Criminal","sub":"Cyber Crime","keywords":["cyber stalking","online harassment","PECA","section 21","intimidation","harass","stalk","online bully"],"punishment":"Up to 3 years or Rs.1 million fine","bailable":False,"severity":"High"},

    # ── NAB / CORRUPTION ──
    {"act":"National Accountability Bureau Ordinance 1999","short":"NAB","sec":"Section 9","title":"Offences of Corruption and Corrupt Practices","text":"A holder of a public office is said to commit corruption if he accepts any gratification other than legal remuneration, or by corrupt or illegal means obtains any property, award, or benefit for himself.","category":"Criminal","sub":"Corruption","keywords":["corruption","bribery","NAB","section 9","public office","corrupt practices","rishwat","کرپشن","bribe"],"punishment":"Up to 14 years + recovery of assets","bailable":False,"severity":"High"},

    # ── CONSUMER ──
    {"act":"Consumer Protection Act","short":"CPA","sec":"General 1","title":"Consumer Rights — Defective Goods or Services","text":"A consumer has the right to claim refund, replacement, or compensation for any defective goods or substandard services. The seller is liable for defects present at the time of sale. The consumer may file a complaint before the Consumer Court.","category":"Consumer","sub":"Consumer Rights","keywords":["consumer","defective","refund","complaint","consumer court","CPA","kharab maal","صارف","product","goods","service"],"punishment":None,"bailable":None,"severity":"Medium"},
]

# Merge extended laws
LAWS_DATA = LAWS_DATA + EXTENDED_LAWS


# ─────────────────────────────────────────────
#  SQLite DB Setup
# ─────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS laws (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            act_name    TEXT NOT NULL,
            act_short   TEXT,
            section_num TEXT NOT NULL,
            title       TEXT NOT NULL,
            text_en     TEXT NOT NULL,
            category    TEXT NOT NULL,
            sub_cat     TEXT,
            keywords    TEXT,
            punishment  TEXT,
            bailable    INTEGER,
            severity    TEXT
        )
    """)
    # Seed if empty
    cur.execute("SELECT COUNT(*) FROM laws")
    if cur.fetchone()[0] == 0:
        for law in LAWS_DATA:
            cur.execute("""
                INSERT INTO laws (act_name,act_short,section_num,title,text_en,category,sub_cat,keywords,punishment,bailable,severity)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            """, (
                law["act"], law["short"], law["sec"], law["title"], law["text"],
                law["category"], law["sub"],
                json.dumps(law["keywords"]),
                law["punishment"],
                1 if law["bailable"] else (0 if law["bailable"] is False else None),
                law["severity"]
            ))
        conn.commit()
    conn.close()


def get_all_laws() -> List[Dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM laws").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["keywords"] = json.loads(d["keywords"]) if d["keywords"] else []
        result.append(d)
    return result


# ─────────────────────────────────────────────
#  NLP Engine
# ─────────────────────────────────────────────
STOPWORDS = {
    "the","a","an","is","in","of","to","and","or","for","with","that","this",
    "by","from","on","at","as","be","are","was","were","has","have","had",
    "will","would","could","should","may","might","shall","not","but","if",
    "it","he","she","they","we","you","me","my","his","her","their","our",
    "do","did","does","been","being","its","than","then","when","where","who",
    "how","what","which","any","all","some","can","also","more","one","two",
    # Urdu stopwords (Roman)
    "mera","meri","mere","main","mujhe","hamara","hamari","aap","apna","apni",
    "yeh","wo","woh","kya","hai","hain","tha","thi","hy","ko","ka","ki","ke",
    "se","mein","par","tak","bhi","hi","na","nahi","hoga","hogi"
}

# Roman Urdu → English keyword mapping
ROMAN_URDU_MAP = {
    "qatl": "murder",
    "chori": "theft",
    "daka": "robbery",
    "dhoka": "fraud",
    "dhamki": "threat",
    "talaq": "divorce",
    "nikah": "marriage",
    "shadi": "marriage",
    "jaidad": "property",
    "zameen": "land",
    "makan": "house",
    "kiraya": "rent",
    "naukri": "job",
    "nokri": "job",
    "mulazim": "employee",
    "tanazkha": "salary",
    "tankhwa": "salary",
    "giraftari": "arrest",
    "rishwat": "bribery",
    "aghwa": "kidnapping",
    "zulm": "cruelty",
    "nafaqa": "maintenance",
    "khula": "divorce",
    "khul": "divorce",
    "bachcha": "child",
    "baccha": "child",
    "mazdoor": "worker",
    "qabza": "possession",
    "nikaal": "dismiss",
    "nikaala": "dismiss",
    "nikaalta": "dismiss",
    "mulazim": "employee",
    "mulazmat": "employment",
    "bartarfi": "termination",
    "tanazkha": "salary",
    "tankhwa": "salary",
    "nokri": "job",
    "badnami": "defamation",
    "insaf": "justice",
    "adalat": "court",
}


def tokenize(text: str) -> List[str]:
    text = text.lower().strip()
    tokens = re.findall(r"[a-z؀-ۿ]+", text)
    expanded = []
    for t in tokens:
        if t not in STOPWORDS and len(t) > 2:
            expanded.append(t)
            if t in ROMAN_URDU_MAP:
                expanded.append(ROMAN_URDU_MAP[t])
    return expanded


def score_law(query_tokens: List[str], law: Dict) -> float:
    keywords = [k.lower() for k in law.get("keywords", [])]
    text_tokens = set(tokenize(law["text_en"] + " " + law["title"]))
    keyword_set = set(keywords)

    score = 0.0
    for token in query_tokens:
        # Exact keyword match = highest weight
        if token in keyword_set:
            score += 4.0
        # Partial keyword match
        elif any(token in kw or kw in token for kw in keyword_set if len(kw) > 3):
            score += 2.0
        # Text match
        elif token in text_tokens:
            score += 1.0

    # Normalize by query length
    total = max(len(query_tokens), 1)
    return round(score / total, 4)


def find_laws(query: str, category: str = None, top_n: int = 5) -> List[Dict]:
    all_laws = get_all_laws()
    query_tokens = tokenize(query)

    if not query_tokens:
        return []

    scored = []
    for law in all_laws:
        if category and law["category"].lower() != category.lower():
            continue
        s = score_law(query_tokens, law)
        if s > 0:
            scored.append((s, law))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [{"score": round(s * 100, 1), **l} for s, l in scored[:top_n]]


# ─────────────────────────────────────────────
#  Accuracy / Win Probability Scorer
# ─────────────────────────────────────────────
def calculate_win_probability(query: str, matched_laws: List[Dict]) -> Dict:
    if not matched_laws:
        return {"win_pct": 50.0, "confidence": "Low", "note": "Insufficient legal precedent matched."}

    # Base from top match score
    top_score = matched_laws[0].get("score", 0)
    base = min(top_score * 0.4, 30)  # max 30 from NLP score

    # Multiple laws found = more established legal basis
    law_count_bonus = min(len(matched_laws) * 4, 16)

    # Severity weighting
    severities = [l.get("severity", "Medium") for l in matched_laws]
    severity_factor = 0
    if "High" in severities:
        severity_factor = 8
    elif "Medium" in severities:
        severity_factor = 4

    # Category bias
    categories = [l.get("category", "") for l in matched_laws]
    if "Criminal" in categories:
        cat_bias = -5  # criminal cases harder (prosecution burden)
    elif "Constitutional" in categories:
        cat_bias = 10  # constitutional rights cases — courts favor petitioner
    elif "Family" in categories:
        cat_bias = 5
    else:
        cat_bias = 3

    win_pct = 50 + base + law_count_bonus + severity_factor + cat_bias
    win_pct = round(max(28.0, min(88.0, win_pct)), 1)

    if win_pct >= 70:
        confidence = "High"
        note = "Aapke haq mein mazboot qanooni bunyad hai."
    elif win_pct >= 50:
        confidence = "Medium"
        note = "Case mein imkan hai magar daleel mazboot karni hogi."
    else:
        confidence = "Low"
        note = "Case mushkil hai — kisi tajurbakar vakeel se zaroor milein."

    return {"win_pct": win_pct, "confidence": confidence, "note": note}
