import {
  buildMessage,
  ValidateBy,
  type ValidationOptions,
} from 'class-validator';

export function codePointLength(value: string): number {
  return [...value].length;
}

export function IsCodePointLength(
  minimum: number,
  maximum: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isCodePointLength',
      constraints: [minimum, maximum],
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            codePointLength(value) >= minimum &&
            codePointLength(value) <= maximum
          );
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            '$property must contain between ' +
            minimum +
            ' and ' +
            maximum +
            ' Unicode code points',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
