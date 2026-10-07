import { HttpService } from "@nestjs/axios";
import { RemoteSendMessage } from "src/data/usecases/chat/http-send-mesage";
import { ChatRemoteRepository } from "src/infra/http/chat/chat-remote-repository";

export const  makeHttpSendMessage = () => {
    const httpRemote = new HttpService();
    const remoteChatRepository = new ChatRemoteRepository(httpRemote);
    return new RemoteSendMessage(remoteChatRepository);
}