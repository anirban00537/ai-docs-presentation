import { Controller, All, Req, Res } from '@nestjs/common';
import { auth } from './auth-lib';
import { toNodeHandler } from 'better-auth/node';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class BetterAuthController {
  @Public()
  @All('*')
  async handleAuth(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res);
  }
}
