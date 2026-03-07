import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.blogPost.findMany()
  
  let updated = 0
  for (const post of posts) {
    let changed = false
    let newCoverImage = post.coverImage
    let newContent = post.content

    if (newCoverImage && newCoverImage.includes('loremflickr.com')) {
      const cacheBuster = Math.floor(Math.random() * 1000000)
      let keyword = 'blog'
      
      const match = newCoverImage.match(/loremflickr\.com\/\d+\/\d+\/([a-zA-Z0-9,_-]+)/);
      if (match) {
        keyword = match[1]
      }
      
      let width = 1200
      let height = 630
      
      const dimMatch = newCoverImage.match(/loremflickr\.com\/(\d+)\/(\d+)\//);
      if (dimMatch) {
        width = parseInt(dimMatch[1]);
        height = parseInt(dimMatch[2]);
      }
      
      newCoverImage = `https://loremflickr.com/${width}/${height}/${keyword}?lock=${cacheBuster}`
      changed = true
    }
    
    if (newContent && newContent.includes('loremflickr.com')) {
      newContent = newContent.replace(/https:\/\/loremflickr\.com\/(\d+)\/(\d+)\/([a-zA-Z0-9,_-]+)/g, (match, w, h, kw) => {
        const cacheBuster = Math.floor(Math.random() * 1000000)
        return `https://loremflickr.com/${w}/${h}/${kw}?lock=${cacheBuster}`
      })
      changed = true
    }
    
    if (changed) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          coverImage: newCoverImage,
          content: newContent
        }
      })
      updated++
      console.log(`Updated post: ${post.title}`)
    }
  }
  
  console.log(`Updated ${updated} posts with new images.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
