import { Controller, Post, HttpCode, Headers } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ChatSessionResponseDto } from "src/main/dto/chat/start-session/start-session.dto";
import { AuthService } from "src/main/usecases/auth/auth.service";
import { ChatService } from "src/service/chat/chat.service";


@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
export class StartSessionController {
    constructor(private readonly authService: AuthService, private readonly chatService: ChatService) { }

    @Post('start-session')
    @HttpCode(200)
    @ApiResponse({ type: ChatSessionResponseDto, status: 200 })
    async handle(@Headers('Authorization') header): Promise<any> {
        const token = header.split('Bearer ')[1];

        const userData = (await this.authService.getUserByToken(token)).payload;
        
        const response = await this.chatService.startSession(userData.profile.id);
        console.log(response);
    }
}