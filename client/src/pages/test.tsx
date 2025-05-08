import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MBTI_QUESTIONS, TestQuestion, MBTI_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Test() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"intro" | "test" | "result">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [mbtiResult, setMbtiResult] = useState<string | null>(null);
  
  const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MBTI_QUESTIONS.length) * 100;
  
  const handleStartTest = () => {
    setCurrentStep("test");
  };
  
  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult();
    }
  };
  
  const calculateResult = () => {
    // 回答を集計
    const counts = {
      E: 0, I: 0,
      S: 0, N: 0,
      T: 0, F: 0,
      J: 0, P: 0
    };
    
    // それぞれの質問カテゴリに基づいて回答を集計
    Object.keys(answers).forEach(questionIndexStr => {
      const questionIndex = parseInt(questionIndexStr);
      const answer = answers[questionIndex];
      const question = MBTI_QUESTIONS[questionIndex];
      
      if (answer !== "neutral") {
        switch (question.category) {
          case "EI":
            answer === "E" ? counts.E++ : counts.I++;
            break;
          case "SN":
            answer === "S" ? counts.S++ : counts.N++;
            break;
          case "TF":
            answer === "T" ? counts.T++ : counts.F++;
            break;
          case "JP":
            answer === "J" ? counts.J++ : counts.P++;
            break;
        }
      }
    });
    
    // 各軸で多い方を選択
    const result = [
      counts.E > counts.I ? "E" : "I",
      counts.S > counts.N ? "S" : "N",
      counts.T > counts.F ? "T" : "F",
      counts.J > counts.P ? "J" : "P"
    ].join("");
    
    setMbtiResult(result);
    setCurrentStep("result");
    
    // ここでAPIリクエストを送信して結果を保存する
    // 実際の実装では、ログインユーザーIDを使う
    const userId = 1; // 仮のユーザーID
    
    apiRequest("POST", "/api/test-response", {
      userId,
      answers,
      result
    }).then(() => {
      toast({
        title: "診断結果が保存されました",
        description: "あなたのMBTIタイプは " + result + " です",
      });
    }).catch(() => {
      toast({
        title: "エラーが発生しました",
        description: "診断結果の保存に失敗しました",
        variant: "destructive"
      });
    });
  };
  
  const getResultDetails = () => {
    if (!mbtiResult) return null;
    return MBTI_TYPES.find(type => type.code === mbtiResult);
  };
  
  const resultDetails = getResultDetails();
  
  const renderIntro = () => (
    <Card className="shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">テストについて</h3>
      <ul className="list-disc pl-5 text-gray-600 space-y-2">
        <li>このテストは約10分で完了します</li>
        <li>直感的に、最も自分に当てはまる回答を選んでください</li>
        <li>「正しい」答えはありません - あなたの自然な傾向を選択してください</li>
        <li>テスト結果はいつでも後から確認できます</li>
      </ul>
      <Button className="mt-6 w-full" onClick={handleStartTest}>
        テストを始める
      </Button>
    </Card>
  );
  
  const renderTest = () => (
    <>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <Progress value={progress} className="h-2.5" />
      </div>
      <p className="text-sm text-gray-500 text-right mb-4">
        質問 {currentQuestionIndex + 1}/{MBTI_QUESTIONS.length}
      </p>
      
      <Card className="shadow-md rounded-lg p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            {currentQuestion.question}
          </h3>
          
          <RadioGroup 
            value={answers[currentQuestionIndex] || ""} 
            onValueChange={handleAnswerSelect}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <RadioGroupItem id={`option-${index}`} value={option.value} />
                <Label htmlFor={`option-${index}`} className="ml-3 block text-gray-700">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              前へ
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestionIndex]}
            >
              {currentQuestionIndex === MBTI_QUESTIONS.length - 1 ? "結果を見る" : "次へ"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
  
  const renderResult = () => (
    <Card className="shadow-md rounded-lg p-6">
      <CardContent className="p-0">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">あなたのMBTIタイプは</h3>
          <div className="mt-4 inline-block px-6 py-3 bg-primary/10 rounded-lg">
            <p className="text-3xl font-bold text-primary">{mbtiResult}</p>
            {resultDetails && <p className="text-lg text-gray-700">{resultDetails.name}</p>}
          </div>
        </div>
        
        {resultDetails && (
          <div className="mt-4">
            <p className="text-gray-700 mb-4">
              {resultDetails.description}
            </p>
            
            <h4 className="font-medium text-gray-900 mb-2">あなたの特徴</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {resultDetails.traits.map((trait, idx) => (
                <div key={idx} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                  {trait}
                </div>
              ))}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">強み</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>独自の視点でものごとを捉えることができる</li>
                  <li>論理的な思考力に優れている</li>
                  <li>創造的な問題解決能力を持っている</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">成長のヒント</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>感情表現をより豊かにする練習をする</li>
                  <li>細部にも注意を払う習慣をつける</li>
                  <li>他者との協力関係を大切にする</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">チームでの役割</h4>
              <p className="text-sm text-gray-600">
                あなたはチームにおいて、分析力や戦略的思考を活かした役割に適しています。
                大局的な視点からプロジェクトを捉え、効率的な方法を提案することができます。
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button onClick={() => window.location.href = "/team-builder"}>
            チーム編成に進む
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">MBTI診断テスト</h2>
            <p className="mt-2 text-lg text-gray-500">
              あなたのMBTIタイプを診断するための質問に答えてください
            </p>
          </div>
          
          {currentStep === "intro" && renderIntro()}
          {currentStep === "test" && renderTest()}
          {currentStep === "result" && renderResult()}
        </div>
      </div>
    </section>
  );
}
