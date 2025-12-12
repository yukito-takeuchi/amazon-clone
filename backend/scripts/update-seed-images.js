const fs = require('fs');
const path = require('path');

// カテゴリIDとフォルダ名のマッピング
const categoryMapping = {
  1: 'books', 2: 'kindle', 3: 'music', 4: 'dvd-bluray', 5: 'games',
  6: 'electronics', 7: 'smartphones', 8: 'computers', 9: 'software', 10: 'stationery',
  11: 'toys', 12: 'hobby', 13: 'musical-instruments', 14: 'sports-outdoors', 15: 'golf',
  16: 'automotive', 17: 'diy-tools-garden', 18: 'industrial', 19: 'home-kitchen', 20: 'drugstore',
  21: 'beauty', 22: 'food-beverages', 23: 'pet-supplies', 24: 'baby-maternity', 25: 'gift-cards',
  26: 'fashion', 27: 'watches', 28: 'jewelry', 29: 'shoes-bags', 30: 'prime-video'
};

const IMAGE_COUNT = 10; // 各カテゴリ10枚の画像

// SQLファイルを読み込む
const sqlFilePath = path.join(__dirname, '../migrations/010_seed_products.sql');
const lines = fs.readFileSync(sqlFilePath, 'utf-8').split('\n');

const categoryCounters = {};
const imageMapping = []; // {categoryId, imageNumber}の配列
let currentCategoryId = null;
let insideInsert = false;

// 商品データを解析して画像マッピングを作成
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // INSERT文の開始を検出
  if (line.includes('INSERT INTO products')) {
    insideInsert = true;
    continue;
  }

  // product_imagesセクションに到達したら終了
  if (line.includes('-- Add product images')) {
    break;
  }

  // 商品行を処理
  if (insideInsert && line.trim().startsWith('(')) {
    // カテゴリIDを抽出
    const match = line.match(/, (\d+), (true|false)\)/);
    if (match) {
      const catId = parseInt(match[1]);

      // カテゴリIDが変わったらカウンターをリセット
      if (currentCategoryId !== catId) {
        currentCategoryId = catId;
        if (!categoryCounters[catId]) {
          categoryCounters[catId] = 0;
        }
      }

      // カウンターをインクリメント
      categoryCounters[catId]++;

      // 画像番号を計算
      const imageNumber = ((categoryCounters[catId] - 1) % IMAGE_COUNT) + 1;
      const folderName = categoryMapping[catId];

      imageMapping.push({
        categoryId: catId,
        folderName: folderName,
        imageNumber: imageNumber,
        imagePath: `/uploads/seed/${folderName}/${imageNumber}.jpg`
      });
    }
  }

  // INSERT文の終了を検出
  if (insideInsert && line.trim() === '') {
    insideInsert = false;
  }
}

// product_imagesセクションを生成
const newSqlLines = [];
let foundProductImagesSection = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // product_imagesセクションに到達したら置換
  if (line.includes('-- Add product images')) {
    foundProductImagesSection = true;
    newSqlLines.push('-- Add product images from seed folder');
    newSqlLines.push('INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES');

    // 各商品の画像をINSERT
    const insertLines = imageMapping.map((item, index) => {
      const productId = index + 1;
      const comma = index < imageMapping.length - 1 ? ',' : ';';
      return `(${productId}, '${item.imagePath}', TRUE, 1)${comma}`;
    });

    newSqlLines.push(...insertLines);
    newSqlLines.push('');

    // 残りの行をスキップ
    break;
  }

  newSqlLines.push(line);
}

// ファイルに書き込み
fs.writeFileSync(sqlFilePath, newSqlLines.join('\n'), 'utf-8');

console.log('✅ Seed SQL file updated successfully!\n');
console.log(`📦 Total products: ${imageMapping.length}`);
console.log(`🖼️  Product images created: ${imageMapping.length}\n`);

console.log('Category breakdown:');
Object.entries(categoryCounters)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .forEach(([catId, count]) => {
    const folderName = categoryMapping[parseInt(catId)];
    console.log(`  ${catId.padStart(2)}. ${folderName.padEnd(20)}: ${count} products`);
  });
