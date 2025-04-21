import '@inertiajs/core';

declare module '@inertiajs/core' {
  interface PageProps {
    deliveryPrice: number;
    // другие общие пропсы...
  }
}