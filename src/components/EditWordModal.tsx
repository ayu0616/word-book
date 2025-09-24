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
  term: z.string().min(1, { message: "Term is required." }).max(255),
  meaning: z.string().min(1, { message: "Meaning is required." }),
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
          <DialogTitle>Edit Word</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
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
                  <FormLabel>Meaning</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
