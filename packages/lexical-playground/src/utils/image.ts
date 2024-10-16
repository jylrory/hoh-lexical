import Compressor from 'compressorjs'

export function compressImage(file: File, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      mimeType: 'image/webp',
      success(result) {
        const fileNameArr = file.name.split('.')
        const fileName = fileNameArr.splice(0, fileNameArr.length - 1).join('.')
        // 将 Blob 转换为 File
        const compressedFile = new File(
          [result],
          `${fileName}.webp`,
          {
            type: 'image/webp',
            lastModified: Date.now(),
          },
        )
        resolve(compressedFile)
      },
      error(err) {
        reject(err)
      },
    })
  })
}
