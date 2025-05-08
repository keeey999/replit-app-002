// MBTI Types and information
export interface MbtiType {
  code: string;
  name: string;
  description: string;
  traits: string[];
  group: MbtiGroup;
  color: string;
}

export type MbtiGroup = "分析家気質" | "外交官気質" | "番人気質" | "探検家気質";

export const MBTI_TYPES: MbtiType[] = [
  // 分析家気質
  {
    code: "INTJ",
    name: "建築家",
    description: "想像力豊かな戦略家。革新的なアイデアと明確な目標を持ち、論理的に計画を実行します。",
    traits: ["分析的", "独立的", "戦略的"],
    group: "分析家気質",
    color: "primary",
  },
  {
    code: "INTP",
    name: "論理学者",
    description: "革新的な発明家。好奇心が強く、理論的思考を駆使して複雑な問題の解決に取り組みます。",
    traits: ["論理的", "好奇心旺盛", "創造的"],
    group: "分析家気質",
    color: "primary",
  },
  {
    code: "ENTJ",
    name: "指揮官",
    description: "大胆かつ想像力豊かなリーダー。常に課題を見つけ、解決策を見い出す強い意志を持っています。",
    traits: ["決断力", "効率性重視", "カリスマ的"],
    group: "分析家気質",
    color: "primary",
  },
  {
    code: "ENTP",
    name: "討論者",
    description: "知的好奇心が強く、論争を好む革新者。様々な可能性を探求し、新しいアイデアに挑戦します。",
    traits: ["革新的", "分析的", "活発"],
    group: "分析家気質",
    color: "primary",
  },
  
  // 外交官気質
  {
    code: "INFJ",
    name: "提唱者",
    description: "静かな神秘主義者であり、利他的な理想主義者。強い誠実さと深い洞察力を持っています。",
    traits: ["理想主義的", "繊細", "創造的"],
    group: "外交官気質",
    color: "secondary",
  },
  {
    code: "INFP",
    name: "仲介者",
    description: "詩的で親切な利他主義者。常に善を見出し、他者を助けようとする強い意志があります。",
    traits: ["創造的", "理想主義的", "誠実"],
    group: "外交官気質",
    color: "secondary",
  },
  {
    code: "ENFJ",
    name: "主人公",
    description: "カリスマ的なリーダー。他者の成長を促す力を持ち、社会的調和を大切にします。",
    traits: ["共感的", "社交的", "リーダーシップ"],
    group: "外交官気質",
    color: "secondary",
  },
  {
    code: "ENFP",
    name: "広報運動家",
    description: "熱心で創造的な自由人。常に新しい可能性を見出し、周囲に活力を与えます。",
    traits: ["熱情的", "創造的", "社交的"],
    group: "外交官気質",
    color: "secondary",
  },
  
  // 番人気質
  {
    code: "ISTJ",
    name: "管理者",
    description: "実践的かつ事実重視の伝統主義者。秩序と組織化を重んじる信頼性の高い人物です。",
    traits: ["実用的", "信頼性", "組織的"],
    group: "番人気質",
    color: "accent",
  },
  {
    code: "ISFJ",
    name: "擁護者",
    description: "非常に献身的で温かい守護者。常に他者を保護し、彼らのニーズに敏感に反応します。",
    traits: ["献身的", "思いやり", "実用的"],
    group: "番人気質",
    color: "accent",
  },
  {
    code: "ESTJ",
    name: "幹部",
    description: "実践的な現実主義者。伝統的な価値観を持ち、社会的な秩序を重視します。",
    traits: ["組織的", "実用的", "伝統的"],
    group: "番人気質",
    color: "accent",
  },
  {
    code: "ESFJ",
    name: "領事",
    description: "非常に思いやりがあり、社交的で協力的。調和を重んじ、他者のニーズに敏感です。",
    traits: ["協力的", "思いやり", "社交的"],
    group: "番人気質",
    color: "accent",
  },
  
  // 探検家気質
  {
    code: "ISTP",
    name: "巨匠",
    description: "大胆で実践的な実験者。様々なツールを使いこなす技術に長けています。",
    traits: ["適応力", "観察力", "実用的"],
    group: "探検家気質",
    color: "warning",
  },
  {
    code: "ISFP",
    name: "冒険家",
    description: "芸術的な精神を持つ探検家。美しさと自由を重んじ、自己表現を大切にします。",
    traits: ["創造的", "共感的", "自由な精神"],
    group: "探検家気質",
    color: "warning",
  },
  {
    code: "ESTP",
    name: "起業家",
    description: "スマートでエネルギッシュな知覚者。リスクを恐れず、実践的な解決策を好みます。",
    traits: ["冒険的", "実用的", "自発的"],
    group: "探検家気質",
    color: "warning",
  },
  {
    code: "ESFP",
    name: "エンターテイナー",
    description: "自発的で活気に満ちた愛の人。常に周囲を楽しませ、センセーションを起こします。",
    traits: ["社交的", "自発的", "楽観的"],
    group: "探検家気質",
    color: "warning",
  },
];

// MBTI軸の説明
export const MBTI_AXES = [
  {
    axis: "E vs I",
    title: "外向型 vs 内向型",
    description: "エネルギーの方向性"
  },
  {
    axis: "S vs N",
    title: "感覚型 vs 直感型",
    description: "情報収集の方法"
  },
  {
    axis: "T vs F",
    title: "思考型 vs 感情型",
    description: "判断の基準"
  },
  {
    axis: "J vs P",
    title: "判断型 vs 知覚型",
    description: "外界への態度"
  }
];

// MBTIテスト質問
export interface TestQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    value: string;
  }[];
  category: "EI" | "SN" | "TF" | "JP";
}

export const MBTI_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: "パーティーや集まりでは、通常あなたは...",
    options: [
      { text: "多くの人々（見知らぬ人も含む）と交流する", value: "E" },
      { text: "知っている人たちとだけ交流する", value: "I" },
      { text: "状況によって異なる", value: "neutral" }
    ],
    category: "EI"
  },
  {
    id: 2,
    question: "あなたは自分のことを次のどれだと思いますか？",
    options: [
      { text: "現実的である", value: "S" },
      { text: "革新的である", value: "N" },
      { text: "両方の面がある", value: "neutral" }
    ],
    category: "SN"
  },
  {
    id: 3,
    question: "以下のどちらがより不快に感じますか？",
    options: [
      { text: "頭の中で考えを整理できない状態", value: "T" },
      { text: "感情的に揺さぶられる状態", value: "F" },
      { text: "どちらも同程度に不快", value: "neutral" }
    ],
    category: "TF"
  },
  {
    id: 4,
    question: "仕事やプロジェクトに取り組む際、あなたは通常...",
    options: [
      { text: "計画を立て、それに従って進める", value: "J" },
      { text: "柔軟に状況に応じて進める", value: "P" },
      { text: "プロジェクトによって異なる", value: "neutral" }
    ],
    category: "JP"
  },
  {
    id: 5,
    question: "あなたは通常、新しい人と出会ったとき...",
    options: [
      { text: "少人数の深い会話を好む", value: "I" },
      { text: "多くの人と会話するのが好き", value: "E" },
      { text: "状況によって異なる", value: "neutral" }
    ],
    category: "EI"
  },
  {
    id: 6,
    question: "情報を処理する際、あなたは主に...",
    options: [
      { text: "実践的な詳細や具体的な事実に注目する", value: "S" },
      { text: "パターンや可能性、意味を探る", value: "N" },
      { text: "両方のアプローチを使う", value: "neutral" }
    ],
    category: "SN"
  },
  {
    id: 7,
    question: "意思決定をする際、あなたは主に何を重視しますか？",
    options: [
      { text: "論理的な分析と客観的な事実", value: "T" },
      { text: "人々への影響と個人的な価値観", value: "F" },
      { text: "状況によって両方を考慮する", value: "neutral" }
    ],
    category: "TF"
  },
  {
    id: 8,
    question: "あなたは予定を...",
    options: [
      { text: "しっかり立て、それに従うのが好き", value: "J" },
      { text: "大まかに立て、状況に応じて変更するのが好き", value: "P" },
      { text: "予定の内容によって異なる", value: "neutral" }
    ],
    category: "JP"
  },
  {
    id: 9,
    question: "長時間人と交流した後、あなたは...",
    options: [
      { text: "エネルギーが満たされ、さらに交流したいと感じる", value: "E" },
      { text: "疲れを感じ、一人の時間が必要だと感じる", value: "I" },
      { text: "人や状況によって異なる", value: "neutral" }
    ],
    category: "EI"
  },
  {
    id: 10,
    question: "あなたは次のどちらに魅力を感じますか？",
    options: [
      { text: "確立された方法と明確な指示", value: "S" },
      { text: "新しいアイデアと創造的なアプローチ", value: "N" },
      { text: "両方に魅力を感じる", value: "neutral" }
    ],
    category: "SN"
  },
  {
    id: 11,
    question: "あなたが友人の問題について話を聞くとき、通常...",
    options: [
      { text: "問題解決のための実践的なアドバイスを提供する", value: "T" },
      { text: "まず感情的なサポートを提供し、共感を示す", value: "F" },
      { text: "状況や友人によって対応を変える", value: "neutral" }
    ],
    category: "TF"
  },
  {
    id: 12,
    question: "あなたの職場や学習環境は...",
    options: [
      { text: "整理整頓され、構造化されているのが好ましい", value: "J" },
      { text: "柔軟で適応性があり、必要に応じて変更できるのが好ましい", value: "P" },
      { text: "作業内容によって好みが異なる", value: "neutral" }
    ],
    category: "JP"
  },
  {
    id: 13,
    question: "グループ活動では、あなたは通常...",
    options: [
      { text: "会話をリードしたり、アイデアを提案したりする", value: "E" },
      { text: "他の人の意見を聞き、必要な時だけ発言する", value: "I" },
      { text: "グループの構成や目的によって役割が変わる", value: "neutral" }
    ],
    category: "EI"
  },
  {
    id: 14,
    question: "小説や映画を楽しむとき、あなたは主に...",
    options: [
      { text: "現実的なストーリーやキャラクターに引かれる", value: "S" },
      { text: "象徴的な意味や未来のビジョンに引かれる", value: "N" },
      { text: "作品のジャンルによって異なる", value: "neutral" }
    ],
    category: "SN"
  },
  {
    id: 15,
    question: "議論の場では、あなたにとって最も重要なのは...",
    options: [
      { text: "真実を見つけ出し、論理的な結論に達すること", value: "T" },
      { text: "調和を維持し、全員が尊重されること", value: "F" },
      { text: "議論のトピックによって優先事項が変わる", value: "neutral" }
    ],
    category: "TF"
  },
  {
    id: 16,
    question: "旅行に行くとき、あなたは通常...",
    options: [
      { text: "詳細な計画を立て、主要な観光スポットを訪れる", value: "J" },
      { text: "大まかな計画だけで、自分の興味に従って探索する", value: "P" },
      { text: "旅行先や同行者によって計画の詳細さを変える", value: "neutral" }
    ],
    category: "JP"
  },
  {
    id: 17,
    question: "あなたは休日を過ごす際、何を好みますか？",
    options: [
      { text: "友人や家族と時間を過ごす社交的な活動", value: "E" },
      { text: "個人的な趣味や静かに過ごす時間", value: "I" },
      { text: "その時の気分や状況による", value: "neutral" }
    ],
    category: "EI"
  },
  {
    id: 18,
    question: "問題に直面したとき、あなたは通常...",
    options: [
      { text: "経験や過去の事例に基づいて解決策を探す", value: "S" },
      { text: "直感や新しいアイデアに基づいて解決策を創造する", value: "N" },
      { text: "問題の性質によってアプローチを変える", value: "neutral" }
    ],
    category: "SN"
  },
  {
    id: 19,
    question: "他者との衝突があった場合、あなたは主に...",
    options: [
      { text: "客観的な事実と論理に基づいて解決しようとする", value: "T" },
      { text: "関係性を重視し、感情や価値観を考慮して解決しようとする", value: "F" },
      { text: "状況や相手によってアプローチを変える", value: "neutral" }
    ],
    category: "TF"
  },
  {
    id: 20,
    question: "締め切りがある作業に取り組む際、あなたは...",
    options: [
      { text: "早めに開始し、計画通りに進める", value: "J" },
      { text: "締め切り直前に集中して取り組むことが多い", value: "P" },
      { text: "作業の種類や重要性によって異なる", value: "neutral" }
    ],
    category: "JP"
  }
];

// チーム編成のオプション
export const TEAM_GOAL_OPTIONS = [
  "問題解決型チーム",
  "創造的プロジェクト",
  "顧客対応チーム",
  "運営管理チーム"
];

export const TEAM_SIZE_OPTIONS = [
  "3-4人",
  "5-6人",
  "7-8人",
  "9人以上"
];

export const TEAM_PRIORITY_OPTIONS = [
  "多様性の確保",
  "相性の良さ",
  "役割バランス",
  "特定スキルの確保"
];

export const TEAM_DURATION_OPTIONS = [
  "短期（1ヶ月未満）",
  "中期（1-3ヶ月）",
  "長期（3ヶ月以上）",
  "継続的"
];

// MBTI相性マトリックス (簡易版)
// 値: "良好" | "普通" | "要注意"
export const MBTI_COMPATIBILITY: Record<string, Record<string, string>> = {
  "INTJ": {
    "INTJ": "普通",
    "INTP": "良好",
    "ENTJ": "良好",
    "ENTP": "良好",
    "INFJ": "良好",
    "INFP": "普通",
    "ENFJ": "普通",
    "ENFP": "普通",
    "ISTJ": "普通",
    "ISFJ": "要注意",
    "ESTJ": "普通",
    "ESFJ": "要注意",
    "ISTP": "普通",
    "ISFP": "要注意",
    "ESTP": "要注意",
    "ESFP": "要注意"
  },
  // 他のタイプも同様に定義
  // 簡略化のため、他のタイプの相性はデフォルト値として処理
};

// 相性のデフォルト値を取得する関数
export function getCompatibility(type1: string, type2: string): string {
  if (!type1 || !type2) return "不明";
  
  // MBTI_COMPATIBILITYに定義されている場合はその値を返す
  if (MBTI_COMPATIBILITY[type1] && MBTI_COMPATIBILITY[type1][type2]) {
    return MBTI_COMPATIBILITY[type1][type2];
  }
  
  // 似たタイプは「普通」、異なるタイプは「要注意」とする簡易ロジック
  const similarLetters = type1.split('').filter((letter, index) => letter === type2[index]).length;
  if (similarLetters >= 3) return "良好";
  if (similarLetters >= 2) return "普通";
  return "要注意";
}

// 相性に応じた背景色クラスを返す関数
export function getCompatibilityColorClass(compatibility: string): string {
  switch (compatibility) {
    case "良好":
      return "bg-green-100 text-green-700";
    case "普通":
      return "bg-yellow-100 text-yellow-700";
    case "要注意":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
