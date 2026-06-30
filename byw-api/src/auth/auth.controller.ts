import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserRole } from './constants';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  @Get('me')
  getProfile(@Req() request: { user: AuthenticatedUser }) {
    return request.user;
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminCheck() {
    return { ok: true };
  }
}
