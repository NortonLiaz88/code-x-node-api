import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PrismaClientService } from 'src/infra/orm/prisma/prisma-client.service';
import { ItemType } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prismaService: PrismaClientService) {}

  public create(createPurchaseDto: CreatePurchaseDto) {
    return this.prismaService.purchase.create({
      data: {
        userId: 1,
        itemId: createPurchaseDto.itemId,
      },
    });
  }

  public async findAll(userId: number) {
    let appFonts = await this.prismaService.storeItem.findMany({
      where: {
        type: ItemType.FONT,
      },
    });

    let appSounds = await this.prismaService.storeItem.findMany({
      where: {
        type: ItemType.SOUND_EFFECT,
      },
    });

    let appBackgrounds = await this.prismaService.storeItem.findMany({
      where: {
        type: ItemType.WALLPAPER,
      },
    });

    const userFonts = await this.prismaService.purchase.findMany({
      where: {
        userId,
        item: {
          type: ItemType.FONT,
        },
      },
    });

    const userSound = await this.prismaService.purchase.findMany({
      where: {
        userId,
        item: {
          type: ItemType.SOUND_EFFECT,
        },
      },
    });

    const userBackgrounds = await this.prismaService.purchase.findMany({
      where: {
        userId,
        item: {
          type: ItemType.WALLPAPER,
        },
      },
    });

    appFonts = appFonts.map((font) => {
      const purchased = userFonts.find(
        (userFont) => userFont.itemId === font.id,
      );
      return {
        ...font,
        purchased: !!purchased,
      };
    });

    appSounds = appSounds.map((sound) => {
      const purchased = userSound.find(
        (userSound) => userSound.itemId === sound.id,
      );
      return {
        ...sound,
        purchased: !!purchased,
      };
    });

    appBackgrounds = appBackgrounds.map((background) => {
      const purchased = userBackgrounds.find(
        (userBackground) => userBackground.itemId === background.id,
      );
      return {
        ...background,
        purchased: !!purchased,
      };
    });

    return {
      app: {
        fonts: appFonts,
        sounds: appSounds,
        backgrounds: appBackgrounds,
      },
      userResources: {
        fonts: userFonts,
        sounds: userSound,
        backgrounds: userBackgrounds,
      },
    };
  }

  public async findMyAssets(userId: number) {
    let fonts = await this.prismaService.purchase.findMany({
      where: {
        item: {
          type: ItemType.FONT,
        }
      },
    });

    let sounds = await this.prismaService.purchase.findMany({
      where: {
        item: {
          type: ItemType.SOUND_EFFECT,
        }
      },
    });

    let background = await this.prismaService.purchase.findMany({
      where: {
        item: {
          type: ItemType.WALLPAPER,
        }
      },
    });

    return {
      fonts: fonts,
      sounds: sounds,
      backgrounds: background,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} purchase`;
  }

  update(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }

  remove(id: number) {
    return `This action removes a #${id} purchase`;
  }
}
