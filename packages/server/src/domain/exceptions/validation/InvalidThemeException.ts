import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class InvalidThemeException extends ValidationException {
  constructor(theme: string, validThemes: string[]) {
    super(
      `Invalid theme: "${theme}". Valid themes are: ${validThemes.join(', ')}`,
      {
        metadata: {
          field: 'theme',
          value: theme,
          constraints: validThemes,
        },
      },
    );

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_THEME;
  }
}
