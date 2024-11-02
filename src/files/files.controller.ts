import { Controller, Get, Res } from "@nestjs/common";
import { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { MinioService } from "./minio.service";
import { Public } from "src/main/usecases/auth/auth.guard";


@ApiTags('app')
@Controller('app')
export class FileController {
    constructor(private readonly minioService: MinioService) {}

    @Get()
    @Public()
    async get(@Res() res: Response) {
        try {
            const fileStream = await this.minioService.getObjectStream('app/app-release.apk');
          
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="app.apk"');
            
            // Envie o stream diretamente para a resposta
            fileStream.pipe(res);
        } catch (error) {
            console.log('ERROR ==> ', error);
            res.status(404).send({message: 'File not found'});
        }
       
    }
    
}