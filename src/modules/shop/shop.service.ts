import { NotFoundError } from '../../shared/errors/AppError';
import { obtenerTiendaPorId, actualizarTienda, eliminarTienda } from './shop.repository';
import { UpdateShopDto } from './shop.types';
import { findUsersByEmail, ensureCustomerForShopUser } from '../auth/auth.repository';
import { firmarTokenConSesionOpcional, SessionMeta } from '../auth/auth.service';
import { UserRole } from '../../shared/types';
import { supabase } from '../../config/supabase';
import path from 'path';

export const obtenerTiendaService = async (shopId: string) => {
  const tienda = await obtenerTiendaPorId(shopId);
  if (!tienda) throw new NotFoundError('Tienda');
  return tienda;
};

export const actualizarTiendaService = async (shopId: string, dto: UpdateShopDto) => {
  const tienda = await actualizarTienda(shopId, dto);
  if (!tienda) throw new NotFoundError('Tienda');
  return tienda;
};

export const subirLogoTiendaService = async (shopId: string, file: Express.Multer.File) => {
  const fileName = `${shopId}/${Date.now()}-${path.basename(file.originalname)}`;
  const { data, error } = await supabase.storage
    .from('shop-logos')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage error: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from('shop-logos')
    .getPublicUrl(data.path);

  const tienda = await actualizarTienda(shopId, { logo_url: publicData.publicUrl });
  if (!tienda) throw new NotFoundError('Tienda');
  return tienda;
};

export const eliminarTiendaService = async (
  shopId: string,
  userEmail: string,
  sessionMeta?: SessionMeta
) => {
  // 1. Desactivamos la tienda actual
  await eliminarTienda(shopId);

  // 2. Buscamos si el usuario tiene otras tiendas activas
  const allUserShops = await findUsersByEmail(userEmail);
  const otherActiveShops = allUserShops.filter((u) => u.shop_id !== shopId && u.is_active);

  if (otherActiveShops.length > 0) {
    // 3. Si tiene otra tienda, generamos un nuevo token para la primera que encontremos
    const nextShop = otherActiveShops[0]!;
    const customerId = await ensureCustomerForShopUser(
      nextShop.shop_id,
      userEmail,
      nextShop.user_name
    );
    const newToken = await firmarTokenConSesionOpcional(
      {
        sub: nextShop.user_id,
        shop_id: nextShop.shop_id,
        email: userEmail,
        role: nextShop.role as UserRole,
        customer_id: customerId,
      },
      sessionMeta
    );

    return {
      deletedShopId: shopId,
      switchedTo: {
        token: newToken,
        shopId: nextShop.shop_id,
        shopName: nextShop.shop_name,
        userId: nextShop.user_id,
      },
    };
  }

  // 4. Si no tiene más tiendas
  return {
    deletedShopId: shopId,
    switchedTo: null,
  };
};
