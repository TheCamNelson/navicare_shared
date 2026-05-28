export type QuestionType = "single" | "multi" | "slider" | "number" | "text" | "yesno";
export interface Question {
    id: string;
    prompt: string;
    type: QuestionType;
    options?: string[];
    min?: number;
    max?: number;
    required: boolean;
    showIf?: (responses: Record<string, unknown>) => boolean;
    helpText?: string;
}
//# sourceMappingURL=question.d.ts.map