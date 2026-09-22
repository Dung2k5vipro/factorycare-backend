const baoCaoService = require("../services/bao_cao.service");
const xuatBaoCaoService = require("../services/xuat_bao_cao.service");

function taoHamLayBaoCao(loaiBaoCao, thongBao) {
  return async function layBaoCao(req, res, next) {
    try {
      const baoCao = await baoCaoService.layBaoCao(loaiBaoCao, req.query);
      return res.status(200).json({
        thanhCong: true,
        thongBao,
        duLieu: baoCao
      });
    } catch (loi) {
      return next(loi);
    }
  };
}

const layBaoCaoSuCo = taoHamLayBaoCao(
  baoCaoService.LOAI_BAO_CAO.SU_CO,
  "Lấy báo cáo sự cố thành công"
);
const layBaoCaoSuaChua = taoHamLayBaoCao(
  baoCaoService.LOAI_BAO_CAO.SUA_CHUA,
  "Lấy báo cáo sửa chữa thành công"
);
const layBaoCaoBaoTri = taoHamLayBaoCao(
  baoCaoService.LOAI_BAO_CAO.BAO_TRI,
  "Lấy báo cáo bảo trì thành công"
);
const layBaoCaoThietBi = taoHamLayBaoCao(
  baoCaoService.LOAI_BAO_CAO.THIET_BI,
  "Lấy báo cáo thiết bị thành công"
);

async function xuatBaoCao(req, res, next) {
  try {
    const file = await xuatBaoCaoService.xuatBaoCao(req.params.loai, req.query);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.tenFile}"`);
    res.setHeader("Content-Length", file.buffer.length);
    return res.status(200).send(file.buffer);
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layBaoCaoSuCo,
  layBaoCaoSuaChua,
  layBaoCaoBaoTri,
  layBaoCaoThietBi,
  xuatBaoCao
};
