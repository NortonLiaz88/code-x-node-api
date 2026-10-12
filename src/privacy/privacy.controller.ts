import { Controller, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/main/usecases/auth/auth.guard';
import { CurrentUser } from 'src/main/decorators/current-user.decorator';
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_VERSION,
} from './privacy-policy';
import { PrivacyService } from './privacy.service';

@ApiTags('privacy')
@Controller()
export class PrivacyController {
  constructor(private readonly privacy: PrivacyService) {}

  @Public()
  @Get('privacy-policy')
  @ApiOperation({
    summary: 'The current privacy policy',
    description:
      'Sign-up must send `version` as `privacyPolicyVersion` to record consent.',
  })
  policy() {
    return {
      version: PRIVACY_POLICY_VERSION,
      sections: PRIVACY_POLICY_SECTIONS,
    };
  }

  @ApiBearerAuth()
  @Get('me/export')
  @ApiOperation({
    summary: "A copy of all the student's data, tutor conversations included",
  })
  exportData(@CurrentUser() user) {
    return this.privacy.exportData(user.payload.id);
  }

  @ApiBearerAuth()
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete the account and everything linked to it',
  })
  @ApiResponse({ status: 204 })
  deleteAccount(@CurrentUser() user) {
    return this.privacy.deleteAccount(user.payload.id);
  }
}
