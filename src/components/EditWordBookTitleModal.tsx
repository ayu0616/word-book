"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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

interface EditWordBookTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordBookId: number;
  currentTitle: string;
  onSave: (newTitle: string) => void;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(255),
});

type FormData = z.infer<typeof formSchema>;

export function EditWordBookTitleModal({
  isOpen,
  onClose,
  wordBookId,
  currentTitle,
  onSave,
}: EditWordBookTitleModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentTitle,
    },
  });

  useEffect(() => {
    form.reset({ title: currentTitle });
  }, [currentTitle, form]);

  const onSubmit = async (values: FormData) => {
    try {
      const response = await fetch(`/api/wordBook/${wordBookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update word book title.");
      }

      onSave(values.title);
      onClose();
    } catch (error) {
      console.error("Error updating word book title:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Word Book Title</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
