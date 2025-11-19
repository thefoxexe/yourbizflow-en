import React, { useState, useEffect, useRef } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Button } from '@/components/ui/button';
    import { Upload, Loader2, Crop } from 'lucide-react';
    import { useToast } from '@/hooks/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
    import 'react-image-crop/dist/ReactCrop.css';

    function canvasPreview(image, canvas, crop) {
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      );
      ctx.restore();
    }

    const CompanyDataDialog = ({ isOpen, onOpenChange }) => {
      const { user, profile, refreshProfile } = useAuth();
      const { toast } = useToast();
      const [companyData, setCompanyData] = useState({
        company_name: '',
        email: '',
        company_address: '',
        company_phone: '',
        company_logo_url: '',
        business_description: '',
        iban: '',
        bic: '',
      });
      const [logoFile, setLogoFile] = useState(null);
      const [isUploading, setIsUploading] = useState(false);
      const [imgSrc, setImgSrc] = useState('');
      const [crop, setCrop] = useState();
      const [isCropping, setIsCropping] = useState(false);
      const [completedCrop, setCompletedCrop] = useState();
      const previewCanvasRef = useRef(null);
      const imgRef = useRef(null);

      useEffect(() => {
        if (profile) {
          setCompanyData({
            company_name: profile.company_name || '',
            email: profile.email || user.email || '',
            company_address: profile.company_address || '',
            company_phone: profile.company_phone || '',
            company_logo_url: profile.company_logo_url || '',
            business_description: profile.business_description || '',
            iban: profile.iban || '',
            bic: profile.bic || '',
          });
        }
      }, [profile, user, isOpen]);

      const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          setCrop(undefined); // Makes crop preview update between images.
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            setImgSrc(reader.result.toString() || '');
            setIsCropping(true);
          });
          reader.readAsDataURL(e.target.files[0]);
        }
      };

      function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
          makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
          width,
          height,
        );
        setCrop(crop);
      }

      const handleCropConfirm = async () => {
        const image = imgRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!image || !previewCanvas || !completedCrop) {
          throw new Error('Crop canvas does not exist');
        }

        canvasPreview(image, previewCanvas, completedCrop);
        
        previewCanvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Failed to create blob');
          }
          const croppedFile = new File([blob], 'logo.png', { type: 'image/png' });
          setLogoFile(croppedFile);
          setIsCropping(false);
          setImgSrc('');
        }, 'image/png');
      };

      const handleSaveCompanyData = async () => {
        if (!companyData.company_name || !companyData.email) {
          toast({ variant: 'destructive', title: 'Champs requis', description: 'Le nom de l\'entreprise et l\'email sont obligatoires.' });
          return;
        }
        setIsUploading(true);

        let logoUrl = companyData.company_logo_url;

        if (logoFile) {
          const fileName = `${user.id}/${Date.now()}.png`;

          const { error: uploadError } = await supabase.storage
            .from('company_assets')
            .upload(fileName, logoFile, {
                cacheControl: '3600',
                upsert: true,
            });

          if (uploadError) {
            toast({ variant: 'destructive', title: 'Erreur d\'upload', description: "Le logo n'a pas pu être téléversé." });
            setIsUploading(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from('company_assets')
            .getPublicUrl(fileName);
          
          logoUrl = urlData.publicUrl;
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            company_name: companyData.company_name,
            company_address: companyData.company_address,
            company_phone: companyData.company_phone,
            company_logo_url: logoUrl,
            business_description: companyData.business_description,
            email: companyData.email,
            iban: companyData.iban,
            bic: companyData.bic,
          })
          .eq('id', user.id);

        setIsUploading(false);

        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "Les données n'ont pas pu être enregistrées." });
        } else {
          toast({ title: 'Succès', description: 'Données de l\'entreprise mises à jour.' });
          onOpenChange(false);
          setLogoFile(null);
          refreshProfile();
        }
      };

      return (
        <>
          <Dialog open={isOpen && !isCropping} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Données de l'entreprise</DialogTitle>
                <DialogDescription>Ces informations apparaîtront sur vos documents et aideront l'IA.</DialogDescription>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto pr-6 -mr-6 grid gap-4 py-4">
                <div className="space-y-2"><Label htmlFor="company_name">Nom de l'entreprise (requis)</Label><Input id="company_name" value={companyData.company_name} onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="email">Email de contact (requis)</Label><Input id="email" type="email" value={companyData.email} onChange={(e) => setCompanyData({...companyData, email: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="company_address">Adresse</Label><Input id="company_address" value={companyData.company_address} onChange={(e) => setCompanyData({...companyData, company_address: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="company_phone">Téléphone</Label><Input id="company_phone" value={companyData.company_phone} onChange={(e) => setCompanyData({...companyData, company_phone: e.target.value})} /></div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="iban">IBAN</Label><Input id="iban" value={companyData.iban} onChange={(e) => setCompanyData({...companyData, iban: e.target.value})} /></div>
                    <div className="space-y-2"><Label htmlFor="bic">BIC / SWIFT</Label><Input id="bic" value={companyData.bic} onChange={(e) => setCompanyData({...companyData, bic: e.target.value})} /></div>
                </div>

                <div className="space-y-2"><Label htmlFor="business_description">Description de l'activité</Label><Textarea id="business_description" placeholder="Ex: Vente de vêtements, conseil en marketing..." value={companyData.business_description} onChange={(e) => setCompanyData({...companyData, business_description: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Logo</Label>
                  <div className="flex items-center gap-4">
                    {(companyData.company_logo_url || logoFile) && (
                        <img src={logoFile ? URL.createObjectURL(logoFile) : companyData.company_logo_url} alt="Logo" className="h-16 w-16 rounded-md object-cover" />
                    )}
                    <Input id="logo-upload" type="file" accept="image/*" onChange={onSelectFile} className="hidden" />
                    <label htmlFor="logo-upload" className="cursor-pointer flex-grow flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md hover:border-primary">
                      <Upload className="w-4 h-4 mr-2" /><span>{logoFile ? logoFile.name : 'Changer le logo'}</span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>Annuler</Button>
                <Button onClick={handleSaveCompanyData} disabled={isUploading}>
                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : 'Sauvegarder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCropping} onOpenChange={setIsCropping}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recadrer le logo</DialogTitle>
                <DialogDescription>Ajustez l'image pour qu'elle soit carrée.</DialogDescription>
              </DialogHeader>
              {imgSrc && (
                <div className="flex flex-col items-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    minWidth={100}
                    minHeight={100}
                  >
                    <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }}/>
                  </ReactCrop>
                </div>
              )}
              {!!completedCrop && (
                 <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
              )}
              <DialogFooter>
                 <Button variant="outline" onClick={() => setIsCropping(false)}>Annuler</Button>
                 <Button onClick={handleCropConfirm}><Crop className="mr-2 h-4 w-4"/>Recadrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    };

    export default CompanyDataDialog;