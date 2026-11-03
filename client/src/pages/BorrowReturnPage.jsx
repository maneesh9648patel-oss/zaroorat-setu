import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ShieldCheck, AlertCircle, QrCode, CheckCircle2, RotateCcw, 
  Search, BookOpen, Utensils, Cpu, Heart, Plus, Sparkles, Filter, Check, X,
  Camera, Video, Image, Play, Pause, Shield, DollarSign, Upload, Eye, FileVideo,
  Layers, PackagePlus, ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function BorrowReturnPage({ onOpenLens, prefilledLensItem, onClearPrefill }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, openAadhaarModal } = useAuth();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Escrow & Handover QR flow states
  const [selectedItem, setSelectedItem] = useState(null);
  const [takeQuantity, setTakeQuantity] = useState(1);
  const [takeDuration, setTakeDuration] = useState(14);
  const [isSubmittingTake, setIsSubmittingTake] = useState(false);
  const [takeError, setTakeError] = useState(null);
  const [takeSuccessTxn, setTakeSuccessTxn] = useState(null);
  const [escrowStep, setEscrowStep] = useState('deposit'); // 'deposit' | 'qr'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'wallet' | 'cash_hub'
  const [isDepositPaid, setIsDepositPaid] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('active'); // 'active' | 'used'
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState(null);

  // Photo & Video Media Inspector modal state
  const [inspectingItem, setInspectingItem] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoPlayerRef = useRef(null);

  // Lend/Sell Item Modal state ("Give Item" form)
  const [showLendModal, setShowLendModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Study Material');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemCondition, setNewItemCondition] = useState('Grade A+ (Like New)');
  const [newItemEstimatedPrice, setNewItemEstimatedPrice] = useState(2200);
  const [newItemLoanDays, setNewItemLoanDays] = useState('30');
  const [newItemImages, setNewItemImages] = useState([]);
  const [newItemVideoUrl, setNewItemVideoUrl] = useState('');
  const [newItemVideoName, setNewItemVideoName] = useState('');
  const [isSubmittingGive, setIsSubmittingGive] = useState(false);
  const [lendSuccess, setLendSuccess] = useState(false);
  const [lendError, setLendError] = useState(null);

  // Listen for AI Lens pre-fill
  useEffect(() => {
    if (prefilledLensItem) {
      if (!user?.aadhaarVerification?.verified) {
        openAadhaarModal();
        if (onClearPrefill) onClearPrefill();
        return;
      }
      setNewItemName(prefilledLensItem.name || '');
      setNewItemCategory(prefilledLensItem.category || 'Study Material');
      setNewItemCondition(prefilledLensItem.condition || 'Grade A+');
      setNewItemEstimatedPrice(prefilledLensItem.estimatedPrice || 2200);
      if (prefilledLensItem.imagePreview) {
        setNewItemImages([prefilledLensItem.imagePreview]);
      }
      setShowLendModal(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefilledLensItem]);

  // Rich Community Catalog encompassing Study Material, Family Utensils, Electronics, and Medical
  const [items, setItems] = useState([
    // Study Material
    {
      id: "itm_study_01",
      name: "B.Tech Engineering Mathematics & Mechanics (Sem 1-4) Book Set",
      category: "Study Material",
      condition: "Very Good (Complete 6-Book Set)",
      conditionGrade: "Grade A",
      loanPeriodDays: 90,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📚",
      estimatedValue: 1600,
      securityDeposit: 800,
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=70",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "सभी पेजों व बाइंडिंग की स्थिति का 10 सेकंड वीडियो"
    },
    {
      id: "itm_study_02",
      name: "Casio fx-991EX ClassWiz Scientific Calculator",
      category: "Study Material",
      condition: "Grade A+ (Solar + Battery Tested)",
      conditionGrade: "Grade A+",
      loanPeriodDays: 30,
      ownerPublicName: "Pooja S. (Student Volunteer)",
      ownerArea: "REC Banda",
      status: "available",
      icon: "🔢",
      estimatedValue: 2200,
      securityDeposit: 1100,
      images: [
        "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "कैलकुलेटर स्क्रीन ऑन व मैट्रिक्स/इक्वेशन टेस्टिंग डेमो"
    },
    {
      id: "itm_study_03",
      name: "UPPSC / UP Civil Services GS Notes & Solved Papers",
      category: "Study Material",
      condition: "Good with essential highlights",
      conditionGrade: "Grade B+",
      loanPeriodDays: 60,
      ownerPublicName: "Manoj Tripathi (Reviewer)",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "📝",
      estimatedValue: 1200,
      securityDeposit: 600,
      images: [
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "नोट्स एवं सॉल्व्ड पेपर्स का इंडेक्स वीडियो"
    },
    {
      id: "itm_study_04",
      name: "Engineering Mini-Drafter & Drawing Board Kit",
      category: "Study Material",
      condition: "Calibrated Steel Clamp & Steel Scale",
      conditionGrade: "Grade A",
      loanPeriodDays: 120,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📐",
      estimatedValue: 1500,
      securityDeposit: 750,
      images: [
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "ड्राफ्टर आर्म स्मूथनेस व 90° एंगल लॉकिंग टेस्ट"
    },
    {
      id: "itm_study_05",
      name: "NCERT Class 10 & 12 Science & Math Books Bundle",
      category: "Study Material",
      condition: "Complete 8 books bundle in pristine condition",
      conditionGrade: "Grade A+",
      loanPeriodDays: 180,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      status: "available",
      icon: "📖",
      estimatedValue: 1400,
      securityDeposit: 700,
      images: [
        "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "कक्षा 10 व 12 पुस्तकों का संपूर्ण बंडल डेमो"
    },

    // Family Utensils
    {
      id: "itm_utensil_01",
      name: "Community Event Large Cooking Cauldron (बड़ा पतीला / देग - 50L)",
      category: "Family Utensils",
      condition: "Heavy Aluminum / 100% Sanitized & Leak-free",
      conditionGrade: "Grade A",
      loanPeriodDays: 7,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🍲",
      estimatedValue: 3200,
      securityDeposit: 1600,
      images: [
        "https://images.unsplash.com/photo-1584990347449-39908a8a91aa?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "पतीले की सतह, पेंदा व हैंडल मजबूती का वीडियो"
    },
    {
      id: "itm_utensil_02",
      name: "50-Person Stainless Steel Thali, Katori & Glass Set",
      category: "Family Utensils",
      condition: "Mirror Polish Heavy Gauge Stainless Steel",
      conditionGrade: "Grade A+",
      loanPeriodDays: 5,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🍽️",
      estimatedValue: 4000,
      securityDeposit: 2000,
      images: [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "50-व्यक्ति थाली, कटोरी व ग्लास सेट की काउंटिंग व स्थिति"
    },
    {
      id: "itm_utensil_03",
      name: "Commercial Heavy Cast Iron Kadhai & Puri Strainer (कड़ाही एवं झारा)",
      category: "Family Utensils",
      condition: "Heavy Seasoned Iron / Non-stick Pre-treated",
      conditionGrade: "Grade A",
      loanPeriodDays: 5,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🍳",
      estimatedValue: 2400,
      securityDeposit: 1200,
      images: [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "भारी लोहे की कड़ाही व झारा कंडीशन डेमो"
    },
    {
      id: "itm_utensil_04",
      name: "25-Liter Stainless Steel Drinking Water Camper / Dispenser",
      category: "Family Utensils",
      condition: "Insulated Double Wall with Brass Tap",
      conditionGrade: "Grade A+",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🚰",
      estimatedValue: 1800,
      securityDeposit: 900,
      images: [
        "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "वाटर कैंपर नल व इंसुलेशन लीकेज चेक वीडियो"
    },
    {
      id: "itm_utensil_05",
      name: "Traditional Brass Ceremony & Pooja Utensil Set (पीतल सेट)",
      category: "Family Utensils",
      condition: "Pure Brass / Gleaming Mirror Finish",
      conditionGrade: "Grade A+",
      loanPeriodDays: 7,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Atarra",
      status: "available",
      icon: "🪔",
      estimatedValue: 3500,
      securityDeposit: 1750,
      images: [
        "https://images.unsplash.com/photo-1567333126229-db29200c25f1?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "पीतल बर्तन सेट व दीया प्लेट स्थिति का वीडियो"
    },

    // Electronics & Tools
    {
      id: "itm_elec_01",
      name: "Digital Multimeter & Soldering Station Repair Kit",
      category: "Electronics",
      condition: "Pro Kit with Solder Wire & Desoldering Pump",
      conditionGrade: "Grade A+",
      loanPeriodDays: 14,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "⚡",
      estimatedValue: 2800,
      securityDeposit: 1400,
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "मल्टीमीटर डिस्प्ले व सोल्डरिंग आयरन हीटिंग टेस्ट"
    },
    {
      id: "itm_elec_02",
      name: "Solar Emergency Lantern with Dual Phone Charging Bank",
      category: "Electronics",
      condition: "Lithium Ferro / 20h light & 10,000mAh Battery",
      conditionGrade: "Grade A",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      status: "available",
      icon: "🔦",
      estimatedValue: 1800,
      securityDeposit: 900,
      images: [
        "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "सोलर पैनल चार्जिंग व फोन चार्जिंग आउटपुट डेमो"
    },
    {
      id: "itm_elec_03",
      name: "Ultrasonic Compressor Nebulizer Machine",
      category: "Electronics",
      condition: "Medical Grade / Sterilized Mask Included",
      conditionGrade: "Grade A+",
      loanPeriodDays: 14,
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "💨",
      estimatedValue: 2100,
      securityDeposit: 1050,
      images: [
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "नेबुलाइजर मिस्ट फ्लो व मोटर ऑपरेशन टेस्ट"
    },
    {
      id: "itm_elec_04",
      name: "Digital Automatic Blood Pressure Monitor (Omron)",
      category: "Electronics",
      condition: "Accurate & Clinically Validated",
      conditionGrade: "Grade A+",
      loanPeriodDays: 21,
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🩺",
      estimatedValue: 2400,
      securityDeposit: 1200,
      images: [
        "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "ऑटोमेटिक कफ इन्फ्लेशन व पल्स रीडिंग टेस्ट"
    },
    {
      id: "itm_elec_05",
      name: "Portable LED Projector & 80-inch Tripod Screen Set",
      category: "Electronics",
      condition: "Full HD 1080p / HDMI & Wireless Cast",
      conditionGrade: "Grade A",
      loanPeriodDays: 4,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📽️",
      estimatedValue: 8500,
      securityDeposit: 4250,
      images: [
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "प्रोजेक्टर ब्राइटनेस व HDMI इनपुट वीडियो टेस्ट"
    },

    // Medical & Mobility
    {
      id: "itm_501",
      name: "Foldable Lightweight Patient Wheelchair with Hand Brakes",
      category: "Medical & Mobility",
      condition: "Mechanically Tested / Dual Handbrakes Operational",
      conditionGrade: "Grade A+",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      status: "borrowed",
      icon: "♿",
      estimatedValue: 6500,
      securityDeposit: 3250,
      images: [
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "पहियों का फ्री रोटेशन व हैंडब्रेक लॉकिंग टेस्ट"
    },
    {
      id: "itm_502",
      name: "Walking Crutches (Pair, Adult adjustable aluminum)",
      category: "Medical & Mobility",
      condition: "Like New with Heavy Rubber Grips & Push-Pin Adjust",
      conditionGrade: "Grade A",
      loanPeriodDays: 21,
      ownerPublicName: "Priya Verma",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🦯",
      estimatedValue: 1200,
      securityDeposit: 600,
      images: [
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&auto=format&fit=crop&q=70"
      ],
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoNote: "एडजस्टेबल पिन व रबर ग्रिप कंडीशन डेमो"
    }
  ]);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ownerArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Sync with Exchange Database on mount
  useEffect(() => {
    const fetchDbItems = async () => {
      try {
        const res = await api.exchange.getItems();
        if (res?.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
          setItems(prev => {
            const dbItems = res.data.items;
            const dbItemMap = new Map(dbItems.map(i => [i.id, i]));
            
            // Update quantities of existing seed items
            const updatedPrev = prev.map(item => {
              if (dbItemMap.has(item.id)) {
                const fromDb = dbItemMap.get(item.id);
                return {
                  ...item,
                  ...fromDb,
                  quantity_total: Number(fromDb.quantity_total || item.quantity_total || 1),
                  quantity_available: Number(fromDb.quantity_available ?? fromDb.quantity_total ?? 1),
                  status: fromDb.status || item.status
                };
              }
              return item;
            });

            // Prepend new custom items from DB
            const existingIds = new Set(prev.map(i => i.id));
            const newFromDb = dbItems.filter(i => !existingIds.has(i.id)).map(i => ({
              ...i,
              icon: i.category === 'Study Material' ? '📚' : i.category === 'Family Utensils' ? '🍲' : i.category === 'Electronics' ? '⚡' : '♿',
              estimatedValue: i.estimatedPrice || i.estimatedValue || 2000,
              securityDeposit: Math.round((i.estimatedPrice || i.estimatedValue || 2000) * 0.5),
              images: i.images?.length > 0 ? i.images : ["https://images.unsplash.com/photo-1584990347449-39908a8a91aa?w=600&auto=format&fit=crop&q=70"],
              videoUrl: i.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              videoNote: i.videoName || "सामान की स्थिति का जांच वीडियो"
            }));

            return [...newFromDb, ...updatedPrev];
          });
        }
      } catch (err) {
        console.warn("Could not fetch items from exchange DB:", err.message);
      }
    };

    fetchDbItems();
  }, []);

  // Handover single-use token logic
  const handleStartBorrow = (item) => {
    if (!user?.aadhaarVerification?.verified) {
      openAadhaarModal();
      return;
    }
    setSelectedItem(item);
    setTakeQuantity(1);
    setTakeDuration(item.loanPeriodDays || 14);
    setEscrowStep('deposit');
    setIsDepositPaid(false);
    setTokenStatus('active');
    setConfirmSuccess(false);
    setDisputeMessage(null);
    setTakeError(null);
    setTakeSuccessTxn(null);
  };

  const handlePayEscrowDeposit = async () => {
    if (!user?.aadhaarVerification?.verified) {
      openAadhaarModal();
      return;
    }
    setIsSubmittingTake(true);
    setTakeError(null);

    try {
      const res = await api.exchange.takeItem({
        itemId: selectedItem.id,
        quantity: takeQuantity,
        duration_days: takeDuration
      });

      if (res?.data?.success) {
        setTakeSuccessTxn(res.data.transaction);
        const updatedItem = res.data.item;
        setItems(prev => prev.map(i => i.id === selectedItem.id ? {
          ...i,
          quantity_available: updatedItem.quantity_available,
          status: updatedItem.status
        } : i));
        setSelectedItem(prev => ({
          ...prev,
          quantity_available: updatedItem.quantity_available,
          status: updatedItem.status
        }));
        setIsDepositPaid(true);
        setEscrowStep('qr');
      }
    } catch (err) {
      console.error("Take item failed:", err);
      setTakeError(err.response?.data?.error || err.message || "सामान लेने में त्रुटि हुई।");
    } finally {
      setIsSubmittingTake(false);
    }
  };

  const handleConfirmHandover = () => {
    setTokenStatus('used');
    setConfirmSuccess(true);
    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'borrowed' } : i));
  };

  const handleDispute = () => {
    setDisputeMessage("Dispute reported to verifiers desk for mediation. Item marked under review.");
  };

  // Open Media Inspector Modal (Photos & Inspection Video)
  const handleOpenMediaInspector = (item) => {
    setInspectingItem(item);
    setActivePhotoIndex(0);
    setIsVideoPlaying(false);
  };

  // Image upload handling for Lend/Sell modal
  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const urls = files.map(file => URL.createObjectURL(file));
    setNewItemImages(prev => [...prev, ...urls]);
  };

  // Video upload handling for Lend/Sell modal
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNewItemVideoUrl(url);
    setNewItemVideoName(file.name);
  };

  // Quick preset sample media
  const handleAddSampleMedia = () => {
    setNewItemImages(prev => [
      ...prev,
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=70"
    ]);
    setNewItemVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    setNewItemVideoName("Working_Condition_Inspection.mp4");
  };

  const handleAddNewItem = async (e) => {
    e.preventDefault();
    if (!user?.aadhaarVerification?.verified) {
      openAadhaarModal();
      return;
    }

    const estVal = Number(newItemEstimatedPrice) || 2000;
    const qty = Math.max(1, Number(newItemQuantity) || 1);

    setIsSubmittingGive(true);
    setLendError(null);

    try {
      const res = await api.exchange.giveItem({
        name: newItemName,
        category: newItemCategory,
        quantity: qty,
        condition: newItemCondition,
        loanPeriodDays: Number(newItemLoanDays),
        estimatedPrice: estVal,
        images: newItemImages.length > 0 ? newItemImages : [
          "https://images.unsplash.com/photo-1584990347449-39908a8a91aa?w=600&auto=format&fit=crop&q=70"
        ],
        videoUrl: newItemVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        videoName: newItemVideoName || "जांच वीडियो"
      });

      if (res?.data?.item) {
        const created = {
          ...res.data.item,
          icon: newItemCategory === 'Study Material' ? '📚' : newItemCategory === 'Family Utensils' ? '🍲' : newItemCategory === 'Electronics' ? '⚡' : '♿',
          estimatedValue: estVal,
          securityDeposit: Math.round(estVal * 0.5),
          images: res.data.item.images?.length > 0 ? res.data.item.images : (newItemImages.length > 0 ? newItemImages : ["https://images.unsplash.com/photo-1584990347449-39908a8a91aa?w=600&auto=format&fit=crop&q=70"]),
          videoUrl: res.data.item.videoUrl || newItemVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          videoNote: newItemVideoName ? `जांच वीडियो: ${newItemVideoName}` : "सामान की कार्यप्रणाली व स्थिति का जांच वीडियो"
        };
        setItems(prev => [created, ...prev]);
      }

      setLendSuccess(true);
      setTimeout(() => {
        setLendSuccess(false);
        setShowLendModal(false);
        setNewItemName('');
        setNewItemQuantity(1);
        setNewItemImages([]);
        setNewItemVideoUrl('');
        setNewItemVideoName('');
      }, 1500);
    } catch (err) {
      console.error("Give item failed:", err);
      setLendError(err.response?.data?.error || err.message || "सामान जोड़ने में विफल।");
    } finally {
      setIsSubmittingGive(false);
    }
  };

  const qrPayload = selectedItem ? JSON.stringify({
    tokenId: `tok_${selectedItem.id}_${Date.now()}`,
    itemId: selectedItem.id,
    receiverId: user?.uid || "usr_aarav",
    securityDeposit: selectedItem.securityDeposit,
    escrowStatus: isDepositPaid ? "ESCROW_LOCKED_50_PCT" : "PENDING",
    nonce: "sec_8841a",
    timestamp: Date.now()
  }) : "";

  return (
    <div className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Header (Full Width) */}
      <div className="bg-darkbrown text-cream p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 rounded-full bg-softYellow/20 text-softYellow text-xs font-bold border border-softYellow/30">
              Circular Sharing Economy · REC Banda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('borrowReturnTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-2xl leading-relaxed">
            {t('borrowSubtitle')} — किताबें, कैलकुलेटर, पतीले, इलेक्ट्रॉनिक्स व मोबिलिटी उपकरण <strong>50% रिफंडेबल सुरक्षा राशि</strong> एवं <strong>फोटो/वीडियो जांच</strong> के साथ सुरक्षित रूप से साझा करें।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            to="/dashboard"
            className="px-4 py-3 rounded-2xl bg-teal-light hover:bg-teal/20 text-teal border border-teal/30 text-xs sm:text-sm font-extrabold shadow-sm transition flex items-center gap-2 tap-target"
            title="स्टॉक एवं अतिदेय डैशबोर्ड देखें"
          >
            <Layers className="w-4 h-4" />
            <span>स्टॉक डैशबोर्ड (Dashboard)</span>
          </Link>

          <Link
            to="/history"
            className="px-4 py-3 rounded-2xl bg-white hover:bg-cream text-darkbrown text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2 border border-darkbrown/15 tap-target"
            title="मेरा आदान-प्रदान इतिहास देखें"
          >
            <Clock className="w-4 h-4 text-terracotta" />
            <span>मेरा इतिहास (My History)</span>
          </Link>

          {onOpenLens && (
            <button
              onClick={onOpenLens}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-dark to-teal hover:opacity-95 text-white text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2 border border-teal/40 tap-target"
              title="Open AI Lens Camera"
            >
              <Camera className="w-4 h-4 text-softYellow" />
              <span>AI Lens कैमरा</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!user?.aadhaarVerification?.verified) {
                openAadhaarModal();
                return;
              }
              setShowLendModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2 tap-target"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>सामान दें (Give Item)</span>
          </button>
        </div>
      </div>

      {/* mAadhaar Verification Warning Banner if User is Not Verified */}
      {!user?.aadhaarVerification?.verified && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-amber-950 flex items-center gap-2">
                <span>mAadhaar सत्यापन आवश्यक (mAadhaar Verification Required)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                  UIDAI Rule
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                नियम: केवल mAadhaar QR सत्यापित नागरिक ही समुदाय में सामान उधार दे या ले सकते हैं।
              </p>
            </div>
          </div>
          <button
            onClick={openAadhaarModal}
            className="px-5 py-2.5 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-softYellow" />
            <span>mAadhaar QR अभी सत्यापित करें</span>
          </button>
        </div>
      )}

      {/* 50% Security Money & Escrow Refund Policy Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-light via-cream to-white border-2 border-teal/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6 text-softYellow" />
          </div>
          <div>
            <div className="font-black text-sm sm:text-base text-darkbrown flex items-center gap-2">
              <span>50% सुरक्षा धरोहर राशि नियम (Refundable Security Escrow)</span>
              <span className="px-2 py-0.5 rounded-full bg-teal text-white text-[10px] font-extrabold">
                100% Refundable
              </span>
            </div>
            <div className="text-xs text-darkbrown/75 mt-0.5 leading-relaxed">
              समान लेते समय वस्तु के अनुमानित मूल्य का <strong>50% सुरक्षा धरोहर</strong> के रूप में सुरक्षित एस्क्रो पूल में जमा होता है। सामान सुरक्षित वापस कर QR स्कैन करते ही यह <strong>तुरंत 100% रिफंड</strong> हो जाता है।
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-2xl bg-white border border-teal/20 text-xs font-bold text-darkbrown">
            🛡️ <span className="text-teal font-black">शून्य चोरी गारंटी</span>
          </div>
          <div className="px-3 py-2 rounded-2xl bg-white border border-teal/20 text-xs font-bold text-darkbrown">
            🎥 <span className="text-terracotta font-black">फोटो/वीडियो से जांच</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-darkbrown/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-darkbrown/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="समान, श्रेणी या मोहल्ला खोजें (उदा. कैलकुलेटर, पतीला, व्हीलचेयर, बुक्स)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-xs font-semibold text-darkbrown focus:ring-2 focus:ring-terracotta outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-darkbrown/40 hover:text-darkbrown"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-darkbrown/70 font-bold px-1 shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal"></span>
            <span>{filteredItems.length} सामान बांदा पूल में उपलब्ध</span>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: t('catAll'), icon: null },
            { id: 'Study Material', label: t('catStudyMaterial'), icon: BookOpen },
            { id: 'Family Utensils', label: t('catFamilyUtensils'), icon: Utensils },
            { id: 'Electronics', label: t('catElectronics'), icon: Cpu },
            { id: 'Medical & Mobility', label: t('catMedicalMobility'), icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-2 rounded-2xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-darkbrown text-cream shadow-sm'
                    : 'bg-cream/60 text-darkbrown/70 border border-darkbrown/10 hover:border-darkbrown/30'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid for Community Catalog Items */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-darkbrown/10 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <div className="font-extrabold text-base text-darkbrown">"{searchQuery}" से मिलता कोई सामान नहीं मिला</div>
          <div className="text-xs text-darkbrown/60 max-w-md mx-auto">
            किताबें, पतीला, कैलकुलेटर या टूल्स खोजें या अपना कोई सामान बांदा समुदाय में साझा करें।
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl bg-white border transition shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md ${
                selectedItem?.id === item.id ? 'border-teal ring-2 ring-teal/20 shadow-md' : 'border-darkbrown/10'
              }`}
            >
              <div className="space-y-3">
                {/* Image Banner / Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-cream border border-darkbrown/10 group cursor-pointer"
                  onClick={() => handleOpenMediaInspector(item)}
                >
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {item.icon}
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-darkbrown/85 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.category}</span>
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.status === 'available' && (item.quantity_available ?? item.quantity_total ?? 1) > 0
                        ? 'bg-teal text-white shadow-xs'
                        : 'bg-softYellow text-darkbrown border border-softYellow'
                    }`}>
                      {item.status === 'available' && (item.quantity_available ?? item.quantity_total ?? 1) > 0 ? 'उपलब्ध' : 'उधार पर'}
                    </span>
                  </div>

                  {/* Media Inspection Prompt Overlay */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] font-bold bg-darkbrown/75 text-cream px-2.5 py-1 rounded-xl backdrop-blur-xs">
                    <span className="flex items-center gap-1">
                      <Image className="w-3 h-3 text-softYellow" />
                      <span>{item.images?.length || 1} फोटो</span>
                    </span>
                    {item.videoUrl && (
                      <span className="flex items-center gap-1 text-softYellow">
                        <Video className="w-3 h-3" />
                        <span>जांच वीडियो</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-darkbrown leading-snug line-clamp-2" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="text-[11px] text-darkbrown/65 mt-1">
                    {t('lentBy')} <strong>{item.ownerPublicName}</strong> · {item.ownerArea}
                  </div>
                </div>

                {/* Database Tracked Quantity Badge */}
                <div className="flex items-center justify-between text-xs bg-cream/70 px-3 py-1.5 rounded-2xl border border-darkbrown/10">
                  <span className="text-[11px] font-bold text-darkbrown/70 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-teal" />
                    <span>मात्रा (Quantity):</span>
                  </span>
                  <span className="font-black text-xs">
                    <span className={(item.quantity_available ?? item.quantity_total ?? 1) > 0 ? "text-teal font-extrabold" : "text-terracotta font-extrabold"}>
                      {item.quantity_available ?? item.quantity_total ?? 1}
                    </span>
                    <span className="text-darkbrown/50 font-semibold"> / {item.quantity_total ?? 1} उपलब्ध</span>
                  </span>
                </div>

                {/* 50% Security Deposit Card Section */}
                <div className="bg-teal-light/60 p-2.5 rounded-2xl border border-teal/20 space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-teal flex items-center gap-1 text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      50% सुरक्षा धरोहर:
                    </span>
                    <span className="text-terracotta font-black text-sm">
                      ₹{item.securityDeposit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-darkbrown/70">
                    <span>अनुमानित मूल्य: <strong>₹{item.estimatedValue}</strong></span>
                    <span className="text-teal font-extrabold">100% रिफंडेबल</span>
                  </div>
                </div>

                {/* Condition & Loan Period */}
                <div className="flex items-center justify-between text-xs bg-cream/50 p-2 rounded-xl">
                  <div className="text-[11px] text-darkbrown/80 truncate mr-1">
                    <span className="font-bold">स्थिति:</span> {item.condition}
                  </div>
                  <div className="text-[11px] font-bold text-teal flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.loanPeriodDays}d</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-1">
                {/* Media preview button */}
                <button
                  onClick={() => handleOpenMediaInspector(item)}
                  className="w-full py-1.5 rounded-xl bg-cream hover:bg-cream-dark text-darkbrown font-bold text-[11px] border border-darkbrown/15 transition flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-teal" />
                  <span>फोटो व वीडियो जांचें (Inspect)</span>
                </button>

                {item.status === 'available' && (item.quantity_available ?? item.quantity_total ?? 1) > 0 ? (
                  <button
                    onClick={() => handleStartBorrow(item)}
                    className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5 tap-target"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>50% धरोहर सहित लें (Take Item)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartBorrow(item)}
                    className="w-full py-2.5 rounded-xl bg-darkbrown/10 hover:bg-darkbrown/20 text-darkbrown font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>लोन स्थिति व QR देखें</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEDIA INSPECTOR MODAL: Photos & Working Video Demonstrations */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{inspectingItem.icon}</span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                    {inspectingItem.name}
                  </h3>
                  <div className="text-[11px] text-cream/70">
                    समान स्थिति निरीक्षण · {inspectingItem.category} · {inspectingItem.ownerPublicName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-cream/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Main Photo Viewer */}
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-darkbrown/10">
                  <img
                    src={inspectingItem.images[activePhotoIndex] || inspectingItem.images[0]}
                    alt={inspectingItem.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-xs">
                    फोटो {activePhotoIndex + 1} / {inspectingItem.images.length}
                  </div>
                </div>

                {/* Photo Thumbnails */}
                {inspectingItem.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {inspectingItem.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                          activePhotoIndex === idx ? 'border-teal shadow-xs' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Working Condition Inspection Video Player */}
              <div className="space-y-2 bg-cream/50 p-4 rounded-3xl border border-darkbrown/10">
                <div className="flex items-center justify-between">
                  <div className="font-black text-xs text-darkbrown flex items-center gap-2">
                    <FileVideo className="w-4 h-4 text-terracotta" />
                    <span>समान की कार्यप्रणाली का जांच वीडियो (Functional Condition Video)</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal text-white">
                    Verified
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center">
                  <video
                    ref={videoPlayerRef}
                    src={inspectingItem.videoUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                    poster={inspectingItem.images[0]}
                  />
                </div>

                <div className="text-[11px] text-darkbrown/75 italic flex items-center gap-1.5 pt-1">
                  <span>🎥</span>
                  <span>{inspectingItem.videoNote}</span>
                </div>
              </div>

              {/* 50% Security Money Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-teal-light border border-teal/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-darkbrown border-b border-teal/20 pb-2">
                  <span className="text-teal flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    50% सुरक्षा धरोहर राशि (100% रिफंडेबल):
                  </span>
                  <span className="text-base font-black text-terracotta">
                    ₹{inspectingItem.securityDeposit}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-darkbrown/80 pt-1">
                  <div>
                    <span className="font-medium">सामान का अनुमानित मूल्य:</span> <strong>₹{inspectingItem.estimatedValue}</strong>
                  </div>
                  <div>
                    <span className="font-medium">उधार शुल्क:</span> <strong className="text-teal">₹0 (सामुदायिक निःशुल्क)</strong>
                  </div>
                </div>
                <div className="text-[11px] text-darkbrown/70 bg-white/70 p-2.5 rounded-xl leading-relaxed">
                  🛡️ <strong>एस्क्रो सुरक्षा गारंटी:</strong> यह राशि सुरक्षित पूल में रहेगी और सामान वापस करते ही QR पुष्टि द्वारा तुरंत 100% रिफंड होगी।
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const itemToBorrow = inspectingItem;
                    setInspectingItem(null);
                    handleStartBorrow(itemToBorrow);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
                >
                  <QrCode className="w-4 h-4" />
                  <span>50% धरोहर जमा कर सामान लें (₹{inspectingItem.securityDeposit})</span>
                </button>

                <button
                  onClick={() => setInspectingItem(null)}
                  className="py-3.5 px-5 rounded-2xl bg-cream hover:bg-cream-dark text-darkbrown font-bold text-xs sm:text-sm border border-darkbrown/15 transition"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 50% SECURITY DEPOSIT ESCROW & SINGLE-USE QR MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-darkbrown text-cream p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight text-white line-clamp-1">
                    {selectedItem.name}
                  </h3>
                  <div className="text-[10px] text-cream/70">
                    {selectedItem.category} · {selectedItem.ownerPublicName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full hover:bg-white/10 text-cream/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-center space-y-4 overflow-y-auto">
              {/* STEP 1: 50% SECURITY ESCROW DEPOSIT CONFIRMATION */}
              {escrowStep === 'deposit' && (
                <div className="space-y-4 text-left">
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-light text-teal border border-teal/30">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-base text-darkbrown">
                      50% सुरक्षा धरोहर राशि जमा करें
                    </h3>
                    <p className="text-xs text-darkbrown/60">
                      समुदाय के सामान की सुरक्षा व विश्वास बनाए रखने हेतु अनिवार्य
                    </p>
                  </div>

                  {/* Quantity & Duration Selector */}
                  <div className="p-3.5 rounded-2xl bg-white border border-darkbrown/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-darkbrown flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal" />
                        <span>लेने हेतु मात्रा (Quantity to Take):</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTakeQuantity(q => Math.max(1, q - 1))}
                          disabled={takeQuantity <= 1 || isSubmittingTake}
                          className="w-8 h-8 rounded-xl bg-cream hover:bg-cream-dark disabled:opacity-40 font-black text-base flex items-center justify-center border border-darkbrown/15 transition text-darkbrown"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-base text-terracotta px-2">
                          {takeQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTakeQuantity(q => Math.min(selectedItem.quantity_available ?? 1, q + 1))}
                          disabled={takeQuantity >= (selectedItem.quantity_available ?? 1) || isSubmittingTake}
                          className="w-8 h-8 rounded-xl bg-cream hover:bg-cream-dark disabled:opacity-40 font-black text-base flex items-center justify-center border border-darkbrown/15 transition text-darkbrown"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Duration & Auto-calculated Due Date */}
                    <div className="pt-2 border-t border-darkbrown/10 flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-darkbrown/80">
                        <Clock className="w-4 h-4 text-terracotta" />
                        <span>उधार अवधि (Duration):</span>
                      </span>
                      <select
                        value={takeDuration}
                        onChange={(e) => setTakeDuration(Number(e.target.value))}
                        className="px-2.5 py-1 rounded-xl bg-cream border border-darkbrown/15 font-black text-xs text-darkbrown outline-none"
                      >
                        <option value="5">5 दिन (इवेंट / विशेष)</option>
                        <option value="7">7 दिन (1 सप्ताह)</option>
                        <option value="14">14 दिन (2 सप्ताह मानक)</option>
                        <option value="30">30 दिन (1 माह)</option>
                        <option value="60">60 दिन (2 माह)</option>
                        <option value="90">90 दिन (सेमेस्टर पाठ्यपुस्तकें)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-darkbrown/70 pt-1 border-t border-darkbrown/10 bg-cream/40 p-2 rounded-xl">
                      <span>स्वतः नियत वापसी (Due Date):</span>
                      <span className="font-black text-teal">
                        {new Date(Date.now() + takeDuration * 24 * 60 * 60 * 1000).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-darkbrown/60 pt-0.5">
                      <span>कैटलॉग में उपलब्ध:</span>
                      <span className="font-bold text-teal">{selectedItem.quantity_available ?? 1} इकाइयाँ उपलब्ध</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-cream/70 border border-darkbrown/10 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-darkbrown/80">
                      <span>सामान का कुल मूल्य ({takeQuantity} इकाई):</span>
                      <span className="font-bold">₹{(selectedItem.estimatedValue || 2000) * takeQuantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-darkbrown/80">
                      <span>सामुदायिक उपयोग शुल्क:</span>
                      <span className="font-bold text-teal">₹0 (निःशुल्क)</span>
                    </div>
                    <div className="border-t border-darkbrown/10 pt-2 flex items-center justify-between font-black text-sm text-darkbrown">
                      <span className="flex items-center gap-1 text-teal">
                        <ShieldCheck className="w-4 h-4" />
                        50% रिफंडेबल सुरक्षा राशि:
                      </span>
                      <span className="text-base text-terracotta font-black">
                        ₹{(selectedItem.securityDeposit || Math.round((selectedItem.estimatedValue || 2000) * 0.5)) * takeQuantity}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-darkbrown uppercase">भुगतान माध्यम चुनें (Choose Escrow Method):</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'upi'
                            ? 'bg-teal-light border-teal font-extrabold text-teal'
                            : 'bg-white border-darkbrown/15 text-darkbrown/70 hover:bg-cream'
                        }`}
                      >
                        <span className="text-base">📱</span>
                        <span className="text-[11px]">UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'wallet'
                            ? 'bg-teal-light border-teal font-extrabold text-teal'
                            : 'bg-white border-darkbrown/15 text-darkbrown/70 hover:bg-cream'
                        }`}
                      >
                        <span className="text-base">👛</span>
                        <span className="text-[11px]">सेतु वॉलेट</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_hub')}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'cash_hub'
                            ? 'bg-teal-light border-teal font-extrabold text-teal'
                            : 'bg-white border-darkbrown/15 text-darkbrown/70 hover:bg-cream'
                        }`}
                      >
                        <span className="text-base">🏢</span>
                        <span className="text-[11px]">हब पर नकद</span>
                      </button>
                    </div>
                  </div>

                  {/* Escrow Guarantee Disclaimer */}
                  <div className="p-3 rounded-2xl bg-teal-light/50 border border-teal/20 text-[11px] text-darkbrown/80 leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                    <div>
                      <strong>100% रिफंड आश्वासन:</strong> सामान की सुरक्षित वापसी और QR स्कैन होते ही ₹{(selectedItem.securityDeposit || Math.round((selectedItem.estimatedValue || 2000) * 0.5)) * takeQuantity} तुरंत आपके खाते में वापस कर दिए जाएंगे।
                    </div>
                  </div>

                  {/* Error Notification */}
                  {takeError && (
                    <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{takeError}</span>
                    </div>
                  )}

                  {/* Proceed Button */}
                  <button
                    onClick={handlePayEscrowDeposit}
                    disabled={isSubmittingTake}
                    className="w-full py-3.5 rounded-2xl bg-teal hover:bg-teal-hover disabled:opacity-60 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
                  >
                    {isSubmittingTake ? (
                      <span>डेटाबेस में दर्ज हो रहा है...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>₹{(selectedItem.securityDeposit || Math.round((selectedItem.estimatedValue || 2000) * 0.5)) * takeQuantity} एस्क्रो में जमा करें व QR कोड पाएं</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 2: VERIFIED SINGLE-USE HANDOVER QR CODE */}
              {escrowStep === 'qr' && (
                <div className="space-y-4">
                  {/* Database Ledger Log Badge */}
                  {takeSuccessTxn && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>लेनदेन डेटाबेस में सफलतापूर्वक दर्ज (Saved in DB)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800 pt-1">
                        <div>
                          <span className="text-emerald-700/80">देने वाला (Giver):</span>
                          <div className="font-bold text-darkbrown truncate">{takeSuccessTxn.giver_name}</div>
                        </div>
                        <div>
                          <span className="text-emerald-700/80">लेने वाला (Receiver):</span>
                          <div className="font-bold text-darkbrown truncate">{takeSuccessTxn.receiver_name}</div>
                        </div>
                        <div>
                          <span className="text-emerald-700/80">ली गई मात्रा:</span>
                          <div className="font-bold text-darkbrown">{takeSuccessTxn.quantity} इकाई</div>
                        </div>
                        <div>
                          <span className="text-emerald-700/80">प्रकार / स्थिति:</span>
                          <div className="font-bold text-emerald-900 uppercase">{takeSuccessTxn.type} · {takeSuccessTxn.status}</div>
                        </div>
                      </div>
                      <div className="pt-1 flex items-center justify-between border-t border-emerald-200/60">
                        <span className="text-[10px] text-emerald-700 font-mono">ID: {takeSuccessTxn.id}</span>
                        <Link
                          to="/history"
                          className="inline-flex items-center gap-1 text-[11px] font-black text-teal hover:underline"
                        >
                          <span>मेरा इतिहास देखें</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-light text-teal text-xs font-black border border-teal/30 mb-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>50% धरोहर राशि एस्क्रो में लॉक: ₹{(selectedItem.securityDeposit || Math.round((selectedItem.estimatedValue || 2000) * 0.5)) * takeQuantity}</span>
                    </div>
                    <div className="font-extrabold text-sm text-darkbrown">
                      {t('showCodePickup')}
                    </div>
                    <div className="text-xs text-darkbrown/60 mt-0.5">
                      सामान सौंपने वाले को यह कोड दिखाएँ।
                    </div>
                  </div>

                  {/* Dynamic QR Box */}
                  <div className="inline-block p-4 rounded-3xl bg-cream border-2 border-darkbrown/10 shadow-inner">
                    {tokenStatus === 'active' ? (
                      <QRCodeSVG
                        value={qrPayload}
                        size={170}
                        bgColor="#FAF1E4"
                        fgColor="#2B1B10"
                        level="H"
                        includeMargin={false}
                      />
                    ) : (
                      <div className="w-[170px] h-[170px] flex flex-col items-center justify-center text-teal space-y-2">
                        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                        <span className="font-black text-sm">Handover Confirmed</span>
                        <span className="text-[10px] text-darkbrown/60">Single-use token consumed</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-darkbrown/60 leading-normal">
                    {t('qrScreenshotWarning')}
                  </div>

                  {/* Return Reminder Box */}
                  <div className="p-3.5 rounded-2xl bg-softYellow/40 border border-softYellow/80 flex items-start gap-2 text-left">
                    <Clock className="w-4 h-4 text-darkbrown shrink-0 mt-0.5" />
                    <p className="text-xs text-darkbrown font-medium leading-relaxed">
                      <strong>वापसी स्मरण:</strong> {selectedItem.loanPeriodDays} दिनों में सामान वापस करने पर <strong>₹{(selectedItem.securityDeposit || Math.round((selectedItem.estimatedValue || 2000) * 0.5)) * takeQuantity} तुरंत रिफंड</strong> हो जाएंगे।
                    </p>
                  </div>

                  {/* Confirm / Action Button */}
                  {tokenStatus === 'active' ? (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={handleConfirmHandover}
                        className="w-full py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-sm shadow-md transition tap-target"
                      >
                        {t('btnConfirmHandover')}
                      </button>
                      <button
                        onClick={handleDispute}
                        className="w-full py-2 rounded-xl text-xs font-bold text-darkbrown/60 hover:text-darkbrown transition"
                      >
                        {t('btnRaiseDispute')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="w-full py-3 rounded-2xl bg-darkbrown text-cream font-bold text-sm transition"
                    >
                      पूर्ण हुआ (Done)
                    </button>
                  )}

                  {disputeMessage && (
                    <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs border border-red-200">
                      {disputeMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEND/SELL AN ITEM MODAL: Image & Video Upload + 50% Security Deposit Calculation */}
      {showLendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-cream rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">समान बेचें या उधार दें (Lend or Sell Resource)</h3>
                <p className="text-[11px] text-cream/70">फोटो व वीडियो के साथ 50% सुरक्षा धरोहर सूचीकरण</p>
              </div>
              <button
                onClick={() => setShowLendModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-cream/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Quick AI Lens Scanner Trigger inside Modal */}
              {onOpenLens && (
                <div 
                  onClick={() => {
                    setShowLendModal(false);
                    onOpenLens();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-teal-light to-white border-2 border-teal/40 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-5 h-5 text-teal" />
                    <div>
                      <div className="font-black text-xs text-darkbrown">AI Lens से ऑटो-स्कैन करें</div>
                      <div className="text-[10px] text-darkbrown/70">कैमरे से फोटो लेते ही नाम, श्रेणी व 50% धरोहर स्वतः भर जाएगी</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-teal text-white">
                    स्कैन करें
                  </span>
                </div>
              )}

              {/* Item Name & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-darkbrown uppercase mb-1">सामान का नाम (Item Name)</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="उदा. Casio fx-991EX Calculator या 50L बड़ा पतीला या व्हीलचेयर"
                    className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkbrown uppercase mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-teal" />
                    <span>मात्रा (Quantity)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-black text-darkbrown outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkbrown uppercase mb-1">श्रेणी (Category)</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                  >
                    <option>Study Material</option>
                    <option>Family Utensils</option>
                    <option>Electronics</option>
                    <option>Medical & Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-darkbrown uppercase mb-1">स्थिति (Condition Grade)</label>
                  <select
                    value={newItemCondition}
                    onChange={(e) => setNewItemCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                  >
                    <option>Grade A+ (Like New / उत्कृष्ट)</option>
                    <option>Grade A (Good & Tested / अच्छी)</option>
                    <option>Grade B+ (Functional with signs of use)</option>
                  </select>
                </div>
              </div>

              {/* Estimated Value & 50% Security Deposit Calculation */}
              <div className="p-3.5 rounded-2xl bg-white border border-teal/30 space-y-2">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-darkbrown uppercase text-[10px] mb-1">
                      सामान का अनुमानित मूल्य (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      step="50"
                      value={newItemEstimatedPrice}
                      onChange={(e) => setNewItemEstimatedPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-darkbrown/20 bg-cream/40 font-bold text-darkbrown outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-teal uppercase text-[10px] mb-1">
                      50% सुरक्षा धरोहर राशि (Auto)
                    </label>
                    <div className="px-3 py-2 rounded-xl bg-teal-light font-black text-terracotta text-sm border border-teal/20">
                      ₹{Math.round((Number(newItemEstimatedPrice) || 0) * 0.5)}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-darkbrown/70 leading-tight">
                  🛡️ यह 50% राशि लेने वाले से एस्क्रो में जमा कराई जाएगी और सामान सही वापस मिलने पर रिफंड होगी।
                </div>
              </div>

              {/* PHOTO UPLOAD SECTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-darkbrown uppercase flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-teal" />
                    <span>सामान की फोटो अपलोड करें (Upload Photos)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSampleMedia}
                    className="text-[10px] text-teal font-extrabold hover:underline"
                  >
                    + टेस्ट फोटो जोड़ें
                  </button>
                </div>

                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-darkbrown/25 rounded-2xl bg-white hover:bg-cream/40 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-darkbrown/40 mb-1" />
                  <span className="font-bold text-darkbrown">फोटो चुनें या यहाँ ड्रैग करें</span>
                  <span className="text-[10px] text-darkbrown/60">JPG, PNG, WebP (एक से अधिक फोटो संभव)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                {/* Previews of uploaded images */}
                {newItemImages.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    {newItemImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-14 rounded-xl overflow-hidden border border-darkbrown/20 shrink-0">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewItemImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEO UPLOAD SECTION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-darkbrown uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-terracotta" />
                    <span>कार्यप्रणाली का वीडियो (Working Condition Video)</span>
                  </label>
                  <span className="text-[10px] text-darkbrown/60">विश्वसनीयता बढ़ाता है</span>
                </div>

                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-darkbrown/25 rounded-2xl bg-white hover:bg-cream/40 cursor-pointer transition">
                  <Video className="w-6 h-6 text-terracotta/70 mb-1" />
                  <span className="font-bold text-darkbrown">समान का 10-30 सेकंड का वीडियो अपलोड करें</span>
                  <span className="text-[10px] text-darkbrown/60">MP4, WebM, MOV (स्क्रीन, पहिया, लीकेज टेस्ट)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>

                {newItemVideoUrl && (
                  <div className="p-2.5 rounded-xl bg-teal-light border border-teal/20 flex items-center justify-between text-[11px] font-bold text-teal">
                    <span className="truncate flex items-center gap-1.5">
                      <FileVideo className="w-3.5 h-3.5" />
                      <span>{newItemVideoName || "Inspection_Video.mp4"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewItemVideoUrl('');
                        setNewItemVideoName('');
                      }}
                      className="text-red-600 ml-2"
                    >
                      हटाएं
                    </button>
                  </div>
                )}
              </div>

              {/* Loan Period */}
              <div>
                <label className="block font-bold text-darkbrown uppercase mb-1">उधार अवधि (Loan Period)</label>
                <select
                  value={newItemLoanDays}
                  onChange={(e) => setNewItemLoanDays(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                >
                  <option value="5">5 दिन (इवेंट / पारिवारिक कार्यक्रम)</option>
                  <option value="7">7 दिन (अल्पकालिक)</option>
                  <option value="14">14 दिन (मानक लोन)</option>
                  <option value="30">30 दिन (कैलकुलेटर / परीक्षा अवधि)</option>
                  <option value="90">90 दिन (सेमेस्टर पाठ्यपुस्तकें)</option>
                </select>
              </div>

              {lendError && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{lendError}</span>
                </div>
              )}

              {lendSuccess ? (
                <div className="p-3.5 rounded-2xl bg-teal text-white font-bold text-center text-sm shadow-md animate-in fade-in">
                  ✓ सामान फोटो, वीडियो व 50% सुरक्षा धरोहर के साथ कैटलॉग में जुड़ गया!
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmittingGive}
                  className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white font-black text-sm shadow-md transition tap-target"
                >
                  {isSubmittingGive ? "डेटाबेस में दर्ज हो रहा है..." : "सामान कैटलॉग में प्रकाशित करें (Publish with 50% Escrow)"}
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}