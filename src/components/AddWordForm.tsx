import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  term: z.string().min(1, { message: "単語は必須です。" }).max(255),
  meaning: z.string().min(1, { message: "意味は必須です。" }),
});

export type AddWordFormData = z.infer<typeof formSchema>;

interface AddWordFormProps {
  onSubmit: (values: AddWordFormData) => void | Promise<void>;
}

export const AddWordForm: FC<AddWordFormProps> = ({ onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      term: "",
      meaning: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      form.reset({
        term: "",
        meaning: "",
      });
    } catch (error) {
      console.error("単語の登録エラー:", error);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>単語</FormLabel>
              <FormControl>
                <Input placeholder="例: Apple" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meaning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>意味</FormLabel>
              <FormControl>
                <Textarea placeholder="例: リンゴ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "登録中..." : "登録"}
        </Button>
      </form>
    </Form>
  );
};
