# BaroStream · Phim Việt cho Stremio

BaroStream 1.2.1 dùng **KKphim** và bổ sung **VSMOV** để thử nghiệm. KKphim trả URL HLS trực tiếp. Các mục VSMOV chỉ có trang nhúng sẽ mở trình duyệt.

## Cài trên Stremio

1. Mở **Addons** trên Stremio Desktop.
2. Dán URL manifest vào ô tìm addon và chọn **Install**.

**[Manifest BaroStream](https://vietstream-stremio.vercel.app/manifest.json)**

## Danh mục

| Danh mục | Lọc thể loại | Tìm theo tên | Phân trang |
| --- | --- | --- | --- |
| Phim lẻ | Có | Có | Có |
| Chiếu rạp | Có | | Có |
| Phim bộ | Có | Có | Có |
| Hoạt hình | Có | | Có |
| VSMOV · Phim lẻ | | Có | Có |
| VSMOV · Phim bộ | | Có | Có |

Bạn có thể mở phim từ **Discover** hoặc từ trang phim có IMDb ID trong Stremio. Phim bộ mở từ danh mục BaroStream có danh sách tập khi KKphim cung cấp dữ liệu.

## Chạy trên máy tính

Cần Node.js 20 để dùng cùng phiên bản với GitHub Actions.

```sh
npm ci
npm test
npm start
```

Mở [manifest cục bộ](http://localhost:7001/manifest.json) từ Stremio Desktop trên cùng máy.

| Biến môi trường | Mặc định | Công dụng |
| --- | --- | --- |
| `PORT` | `7001` | Cổng của addon |
| `KKPHIM_API_URL` | `https://phimapi.com` | API KKphim |
| `KKPHIM_CDN_IMAGE` | `https://phimimg.com` | Máy chủ ảnh phim |
| `CINEMETA_URL` | `https://v3-cinemeta.strem.io` | Tra thông tin phim theo IMDb ID |
| `VERSION` | `1.2.1` | Phiên bản hiển thị trong manifest |

## Kiểm tra API

| Đường dẫn | Kết quả |
| --- | --- |
| `/manifest.json` | Manifest và danh mục |
| `/catalog/movie/kkphim-phim-le.json` | Danh sách phim lẻ |
| `/catalog/movie/kkphim-phim-le/search=Interstellar.json` | Tìm phim lẻ theo tên |
| `/catalog/series/kkphim-phim-bo/skip=20.json` | Trang tiếp theo của danh mục phim bộ |
| `/meta/movie/kk_oppenheimer.json` | Thông tin Oppenheimer theo ID KKphim |
| `/stream/movie/tt0816692.json` | Nguồn của Interstellar theo IMDb ID |

Repo được fork từ [henryhnguy/vietstream-nuvio-addon](https://github.com/henryhnguy/vietstream-nuvio-addon). Repo cũng chứa [plugin Nuvio Mobile](nuvio-plugin/README.md) với manifest riêng dành cho Nuvio.
