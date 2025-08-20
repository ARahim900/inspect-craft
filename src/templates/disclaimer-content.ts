export interface DisclaimerData {
  clientName: string;
  propertyGrade: string;
  inspectionDate: string;
  inspectorName: string;
  propertyLocation: string;
}

export const getDisclaimerContent = (data: DisclaimerData) => {
  return {
    overview: {
      english: `OVERVIEW

Dear Mr. ${data.clientName},

Thank you for choosing Wasla Real Estate Solutions as your home inspector.
Your prospective home is basically in grade (${data.propertyGrade}) as per our inspection and classifications. However, a number of rather typical inspection issues were identified.
Please review the annexed report carefully before making your decision. If you need further explanation regarding this property conditions, please don't hesitate to call or email us from 9:00 am to 5:00 PM at:

Email: wasla.solution@gmail.com
Mobile: +968 90699799`,
      arabic: `نظرة عامة

الأفاضل/ ${data.clientName} المحترمون

نشكر لكم اختياركم "وصلة للحلول العقارية" للقيام بفحص العقار الخاص بكم.
وفقًا للفحص والتصنيف المعتمد لدينا، فإن العقار الذي ترغبون في شرائه يقع ضمن الدرجة (${data.propertyGrade})، مع وجود بعض الملاحظات التي تُعد شائعة في عمليات الفحص العقاري.
يرجى مراجعة التقرير المرفق بعناية قبل اتخاذ قراركم النهائي، وإذا كنتم بحاجة إلى توضيحات إضافية حول حالة العقار، فلا تترددوا بالتواصل معنا عبر الهاتف أو البريد الإلكتروني من الساعة 9 صباحًا حتى 5 مساءً على وسائل التواصل التالية:

البريد الإلكتروني: wasla.solution@gmail.com
الهاتف: +968 90699799`
    },
    disclaimerBoxes: [
      {
        title: {
          english: "No property is perfect.",
          arabic: "لا يوجد عقار مثالي"
        },
        content: {
          english: "Every property has some issues. This report identifies the most important ones so you can make an informed decision. Minor cosmetic issues and normal wear and tear are to be expected in any property.",
          arabic: "كل عقار به بعض المشاكل. يحدد هذا التقرير أهم المشاكل حتى تتمكن من اتخاذ قرار مدروس. من المتوقع وجود مشاكل جمالية طفيفة وتآكل طبيعي في أي عقار."
        }
      },
      {
        title: {
          english: "This report is not an appraisal.",
          arabic: "هذا التقرير ليس تقييمًا سعريًا"
        },
        content: {
          english: "This inspection report does not determine the market value of the property. We examine the condition of the property's systems and structure, not its worth in the current real estate market.",
          arabic: "تقرير الفحص هذا لا يحدد القيمة السوقية للعقار. نحن نفحص حالة أنظمة العقار وهيكله، وليس قيمته في سوق العقارات الحالي."
        }
      },
      {
        title: {
          english: "Maintenance costs are normal.",
          arabic: "تكاليف الصيانة أمر طبيعي"
        },
        content: {
          english: "All properties require ongoing maintenance. Budget for regular upkeep including painting, cleaning, and minor repairs. Major systems may need updates or replacement over time.",
          arabic: "تتطلب جميع العقارات صيانة مستمرة. ضع ميزانية للصيانة المنتظمة بما في ذلك الطلاء والتنظيف والإصلاحات الطفيفة. قد تحتاج الأنظمة الرئيسية إلى تحديثات أو استبدال مع مرور الوقت."
        }
      },
      {
        title: {
          english: "SCOPE OF THE INSPECTION:",
          arabic: "نطاق الفحص"
        },
        content: {
          english: "We inspect visible and accessible areas of the property including structural elements, electrical systems, plumbing, HVAC, interior and exterior components. We do not move furniture or inspect areas that are not readily accessible.",
          arabic: "نحن نفحص المناطق المرئية والقابلة للوصول في العقار بما في ذلك العناصر الهيكلية والأنظمة الكهربائية والسباكة والتدفئة والتكييف والمكونات الداخلية والخارجية. لا نحرك الأثاث أو نفحص المناطق التي ليست قابلة للوصول بسهولة."
        }
      }
    ],
    confidentiality: {
      title: {
        english: "CONFIDENTIALITY OF THE REPORT:",
        arabic: "سرية التقرير"
      },
      content: {
        english: "This report is confidential and prepared exclusively for the named client. It may not be used by any other party or for any other property. The report is not valid for insurance claims, legal proceedings, or any purpose other than informing the client about the property's condition at the time of inspection.",
        arabic: "هذا التقرير سري ومعد حصرياً للعميل المذكور. لا يجوز استخدامه من قبل أي طرف آخر أو لأي عقار آخر. التقرير غير صالح لمطالبات التأمين أو الإجراءات القانونية أو أي غرض آخر غير إعلام العميل بحالة العقار وقت الفحص."
      }
    },
    gradeTable: {
      grades: [
        { code: 'AAA', english: 'Excellent', arabic: 'ممتاز' },
        { code: 'AA', english: 'Very Good', arabic: 'جيد جداً' },
        { code: 'A', english: 'Good', arabic: 'جيد' },
        { code: 'B', english: 'Meeting the standards', arabic: 'يستوفي المعايير' },
        { code: 'C', english: 'Acceptable', arabic: 'مقبول' },
        { code: 'D', english: 'Require maintenance', arabic: 'يحتاج صيانة' }
      ]
    }
  };
};