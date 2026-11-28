import { ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ValidationPipe } from './validation.pipe';

class RegistrationDto {
  @IsNotEmpty()
  readonly username!: string;

  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  readonly password!: string;
}

const metadata: ArgumentMetadata = { type: 'body', metatype: RegistrationDto, data: 'user' };

describe('ValidationPipe registration', () => {
  it('[QP-SMNEST-5-1] Rejects a registration whose only invalid field is an empty username', async () => {
    const pipe = new ValidationPipe();
    const value = { username: '', email: 'test@test.com', password: 'secret' };

    const error = await pipe.transform(value, metadata).catch(e => e);

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toMatchObject({ message: 'Input data validation failed' });
  });

  it('[QP-SMNEST-5-2] Still rejects a registration with two invalid fields with the same message', async () => {
    const pipe = new ValidationPipe();
    const value = { username: '', email: 'not-an-email', password: 'secret' };

    const error = await pipe.transform(value, metadata).catch(e => e);

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toMatchObject({ message: 'Input data validation failed' });
  });

  it('[QP-SMNEST-5-3] Accepts a registration with no invalid fields', async () => {
    const pipe = new ValidationPipe();
    const value = { username: 'test', email: 'test@test.com', password: 'secret' };

    expect(await pipe.transform(value, metadata)).toBe(value);
  });
});
