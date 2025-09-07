import { useState } from 'react';
import { Product } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Copy, Calculator } from 'lucide-react';

interface PhotocopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, quantity: number, customPrice?: number) => void;
}

export const PhotocopyDialog = ({ isOpen, onClose, product, onAddToCart }: PhotocopyDialogProps) => {
  const [quantity, setQuantity] = useState(0);
  const [customPrice, setCustomPrice] = useState('');
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const [totalPriceInput, setTotalPriceInput] = useState('');
  const [useTotalPrice, setUseTotalPrice] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTieredPrice = (qty: number) => {
    if (qty >= 1000) return 260;
    if (qty >= 400) return 275;
    if (qty >= 150) return 290;
    return product.sellPrice;
  };

  const finalPrice = useTotalPrice && totalPriceInput ? 
    parseFloat(totalPriceInput) / quantity :
    useCustomPrice && customPrice ? 
      parseFloat(customPrice) : getTieredPrice(quantity);
  
  const calculatedTotal = useTotalPrice && totalPriceInput ? 
    parseFloat(totalPriceInput) : finalPrice * quantity;

  const handleSubmit = () => {
    if (quantity === 0) return; // Don't allow zero quantity
    
    const priceToUse = useTotalPrice && totalPriceInput ? 
      parseFloat(totalPriceInput) / quantity :
      useCustomPrice && customPrice ? 
        parseFloat(customPrice) : getTieredPrice(quantity);
    onAddToCart(product, quantity, priceToUse);
    onClose();
    setQuantity(0);
    setCustomPrice('');
    setUseCustomPrice(false);
    setTotalPriceInput('');
    setUseTotalPrice(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Fotocopy A4
          </DialogTitle>
          <DialogDescription>
            Pilih metode input harga untuk layanan fotocopy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="useQuantityMethod"
                name="inputMethod"
                checked={!useTotalPrice}
                onChange={() => setUseTotalPrice(false)}
                className="rounded border border-input"
              />
              <Label htmlFor="useQuantityMethod" className="text-sm font-medium">
                Input berdasarkan jumlah lembar
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="useTotalMethod"
                name="inputMethod"
                checked={useTotalPrice}
                onChange={() => setUseTotalPrice(true)}
                className="rounded border border-input"
              />
              <Label htmlFor="useTotalMethod" className="text-sm font-medium">
                Input harga total langsung
              </Label>
            </div>
          </div>

          {!useTotalPrice ? (
            <>
              {/* Quantity Input */}
              <div>
                <Label htmlFor="quantity">Jumlah Lembar</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Masukkan jumlah lembar"
                  min="0"
                  className="text-lg"
                />
              </div>

              {/* Custom Price Option */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useCustomPrice"
                    checked={useCustomPrice}
                    onChange={(e) => setUseCustomPrice(e.target.checked)}
                    className="rounded border border-input"
                  />
                  <Label htmlFor="useCustomPrice" className="text-sm">
                    Gunakan harga custom per lembar
                  </Label>
                </div>
                
                {useCustomPrice && (
                  <Input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Harga per lembar (Rp)"
                    min="0"
                    step="50"
                  />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Total Price Input */}
              <div>
                <Label htmlFor="totalPrice">Total Harga (Rp)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  value={totalPriceInput}
                  onChange={(e) => setTotalPriceInput(e.target.value)}
                  placeholder="Masukkan total harga fotocopy"
                  min="0"
                  step="1000"
                  className="text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="quantityForTotal">Jumlah Lembar (opsional)</Label>
                <Input
                  id="quantityForTotal"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Jumlah lembar untuk referensi"
                  min="0"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opsional: untuk menghitung harga per lembar
                </p>
              </div>
            </>
          )}

          {/* Summary */}
          <Card className="p-4 bg-primary/10">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-semibold">{quantity} lembar</span>
              </div>
              {!useTotalPrice && (
                <div className="flex justify-between">
                  <span>Harga per lembar:</span>
                  <span className="font-semibold">{formatPrice(finalPrice)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(calculatedTotal)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button className="flex-1" variant="success" onClick={handleSubmit}>
              Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};