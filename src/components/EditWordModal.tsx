"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";

interface EditWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: {
    id: number;
    term: string;
    meaning: string;
  };
  onSave: (updatedWord: { id: number; term: string; meaning: string }) => void;
}

const formSchema = z.object({
  term: z.string().min(1, { message: "単語は必須です。" }).max(255),
  meaning: z.string().min(1, { message: "意味は必須です。" }),
});

type FormData = z.infer<typeof formSchema>;

export function EditWordModal({
  isOpen,
  onClose,
  word,
  onSave,
}: EditWordModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      term: word.term,
      meaning: word.meaning,
    },
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormData) => {
    try {
      const res = await client.word[":id"].$put({
        json: values,
        param: {
          id: word.id.toString(),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to update word.");
      }

      const updatedWord = await res.json();
      onSave(updatedWord.word); // Assuming the API returns { ok: true, word: updatedWord }
      onClose();
    } catch (error) {
      console.error("Error updating word:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>単語を編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>単語</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                変更を保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
