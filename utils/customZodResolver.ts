import { ZodError, ZodType } from "zod"
import { FieldError, FieldErrors, FieldValues, Resolver } from "react-hook-form"

// Utility to convert ZodError to Hook Form-compatible FieldErrors
const zodToHookFormErrors = <TFieldValues extends FieldValues>(
  zodError: ZodError,
): FieldErrors<TFieldValues> => {
  const errors: FieldErrors = {}

  for (const issue of zodError.issues) {
    const path = issue.path.join(".") || "root"
    errors[path] = {
      type: issue.code,
      message: issue.message,
    } as FieldError
  }

  return errors as FieldErrors<TFieldValues>
}

// Custom resolver for useForm()
export const customZodResolver = <T extends ZodType<any, any, any>>(
  schema: T,
): Resolver<T["_output"], any> =>
  (async (values: FieldValues) => {
    try {
      const result = await schema.safeParseAsync(values)

      if (result.success) {
        return {
          values: result.data,
          errors: {},
        }
      } else {
        return {
          values: {},
          errors: zodToHookFormErrors<T["_output"]>(result.error),
        }
      }
    } catch (error) {
      console.error("Resolver error: ", error)
      return {
        values: {},
        errors: {
          root: {
            type: "unknown",
            message: "An unknown error occurred during validation",
          } as FieldError,
        },
      }
    }
  }) as Resolver<T["_output"], any>
