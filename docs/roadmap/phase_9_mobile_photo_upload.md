# Phase 9: Mobile Photo Upload to Square Menu Items

## Goal

Enable cafe staff to take photos of menu items using their mobile device and upload them directly into Square menu items through the admin dashboard. No desktop required — staff can photograph a new dish and have it live on the website within seconds.

---

## Architecture

```
┌──────────────────────┐
│   Mobile Browser     │
│  (or PWA / App)      │
│                      │
│  1. Open dashboard   │
│  2. Tap item to edit │
│  3. Tap camera icon  │
│  4. Take/choose photo│
│  5. Confirm & upload │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│              SaaS Platform Admin Dashboard        │
│                                                  │
│  /dashboard/menu/[id]                            │
│                                                  │
│  Camera access via MediaDevices API               │
│  Client-side: preview, crop, resize               │
│  Upload: POST /api/admin/catalog/image            │
│  CMS image library also accessible via /dashboard │
│  /cms/assets for reuse across content pages       │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│           Square Catalog API                      │
│                                                  │
│  1. CreateCatalogImage → upload image binary      │
│  2. UpsertCatalogObject → link image to item      │
│  3. Image appears on website menu (next ISR)      │
└──────────────────────────────────────────────────┘
```

---

## What's Built

### 1. Mobile Camera Integration

Uses the browser's `MediaDevices` API to capture photos directly from the camera. Works on iOS Safari and Android Chrome — no native app required.

```typescript
// components/dashboard/CameraCapture.tsx
export function CameraCapture({ onCapture }: { onCapture: (blob: Blob) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1920, height: 1920 },
    });
    videoRef.current!.srcObject = stream;
  }

  function capture() {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
      // Stop camera stream
      video.srcObject?.getTracks().forEach((t) => t.stop());
    }, 'image/jpeg', 0.9);
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline className="rounded-lg" />
      <canvas ref={canvasRef} className="hidden" />
      <Button onClick={startCamera}>Open Camera</Button>
      <Button onClick={capture}>Capture</Button>
    </div>
  );
}
```

### 2. Image Crop, Resize & Preview

Before uploading, the user can crop and resize the photo. Square recommends square images (at least 300x300, ideally 1024x1024).

- Client-side cropping via a canvas-based crop tool
- Auto-resize to Square's optimal dimensions
- Preview showing how it will look on the menu card
- Undo/re-take option before confirming

### 3. Upload to Square Catalog API

```typescript
// app/api/admin/catalog/image/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  const itemId = formData.get('itemId') as string;

  // Step 1: Upload image to Square
  const { result: imageResult } = await catalogApi.createCatalogImage({
    idempotencyKey: crypto.randomUUID(),
    image: {
      type: 'IMAGE',
      id: `#${crypto.randomUUID()}`,
      imageData: {
        name: `menu-${itemId}-${Date.now()}`,
        caption: `Photo for item ${itemId}`,
      },
    },
    file: Buffer.from(await file.arrayBuffer()),
    // Square accepts JPEG/PNG, max 10MB
  });

  const imageId = imageResult.image?.id;

  // Step 2: Link image to menu item
  // Must retrieve current item first (full override pattern)
  const { result: itemResult } = await catalogApi.retrieveCatalogObject(itemId, true);
  const item = itemResult.catalogObject!;
  item.imageIds = [imageId!, ...(item.imageIds ?? [])]; // prepend as primary

  await catalogApi.upsertCatalogObject({
    idempotencyKey: crypto.randomUUID(),
    object: item,
  });

  return Response.json({ imageId });
}
```

### 4. Responsive Admin Dashboard UI

The upload UI is fully responsive and works on mobile screens:
- Camera viewfinder fills the screen on mobile
- Large tap targets for capture/retake/confirm
- Progress indicator during upload
- Preview of image on the menu card after upload
- Option to reorder images (drag to set primary)

### 5. Progressive Web App (Optional)

For the best mobile experience, the dashboard can be installed as a PWA:
- `manifest.json` with standalone display mode
- Service worker for offline access to cached catalog data
- Camera access via standard web APIs (already supported)
- "Add to Home Screen" prompt for cafe staff

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Camera access** | MediaDevices API | No native app needed. Works on iOS Safari and Android Chrome. |
| **Image processing** | Canvas API (client-side) | Crop, resize, and compress before upload. Zero server cost. |
| **Upload format** | JPEG @ 0.9 quality | Good quality, small file size. Square accepts JPEG/PNG. |
| **Image link** | UpsertCatalogObject | Must use full-override pattern with retrieved object. |
| **PWA** | Optional enhancement | Better mobile UX, but not required for core functionality. |
| **Image storage** | Square Catalog API (menu) + Platform CMS assets (content) | Menu images live in Square. Content page images flow through the platform CMS asset library (S3/R2). |

---

## Environment Variables (No additions needed)

Reuses Phase 3+ environment variables. No new credentials required.

---

## Deliverable

- Cafe staff can photograph menu items with their phone camera via the browser
- Client-side crop, resize, and preview before upload
- Photo uploads to Square Catalog API and links to the menu item
- Images also accessible via platform CMS asset library for reuse in content pages
- Image appears on the website menu on the next ISR revalidation
- Fully responsive UI works on mobile browsers (iOS Safari, Android Chrome)
- Optional PWA install for a native-like experience
- No native app required — zero app store friction
