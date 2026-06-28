"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Save, Plus, Trash2 } from 'lucide-react';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';

interface SocialLink {
    name: string
    url: string
    icon: string
}

const SOCIAL_PLATFORMS = [
    { name: "Facebook", icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
    { name: "Instagram", icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
    { name: "Twitter", icon: "https://cdn-icons-png.flaticon.com/512/733/733579.png" },
    { name: "YouTube", icon: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
    { name: "TikTok", icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png" },
]

const Page = () => {
    const { seller, isLoading } = useSeller();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: "",
        bio: "",
        address: "",
        opening_hours: "",
        website: "",
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    useEffect(() => {
        if (seller?.shop) {
            setForm({
                name: seller.shop.name || "",
                bio: seller.shop.bio || "",
                address: seller.shop.address || "",
                opening_hours: seller.shop.opening_hours || "",
                website: seller.shop.website || "",
            });
            setSocialLinks(seller.shop.socialLinks || []);
        }
    }, [seller]);

    const { mutate: updateAvatar, isPending: avatarPending } = useMutation({
        mutationFn: async (imageUrl: string) =>
            axiosInstance.put("/seller/api/update-image", { editType: "avatar", imageUrl }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller"] }),
        onError: (err) => console.error("Avatar update failed", err),
    });

    const { mutate: updateCover, isPending: coverPending } = useMutation({
        mutationFn: async (imageUrl: string) =>
            axiosInstance.put("/seller/api/update-image", { editType: "cover", imageUrl }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller"] }),
        onError: (err) => console.error("Cover update failed", err),
    });

    const { mutate: updateProfile, isPending } = useMutation({
        mutationFn: async () =>
            axiosInstance.put("/seller/api/edit-profile", { ...form, socialLinks }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seller"] });
            router.push("/");
        },
        onError: (err) => console.error("Profile update failed", err),
    });

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (file: File | null, editType: "avatar" | "cover") => {
        if (!file) return;
        try {
            const fileName = await convertFileToBase64(file);
            const response = await axiosInstance.post("/seller/api/upload-image", { fileName });
            const imageUrl = response.data.url;
            if (editType === "avatar") updateAvatar(imageUrl);
            else updateCover(imageUrl);
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const addSocialLink = () => {
        setSocialLinks((prev) => [...prev, { name: "Facebook", url: "", icon: SOCIAL_PLATFORMS[0].icon }]);
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        setSocialLinks((prev) =>
            prev.map((link, i) => {
                if (i !== index) return link;
                if (field === "name") {
                    const platform = SOCIAL_PLATFORMS.find((p) => p.name === value);
                    return { ...link, name: value, icon: platform?.icon || link.icon };
                }
                return { ...link, [field]: value };
            })
        );
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-900 min-h-screen pb-12">

            {/* Back Button */}
            <div className="w-full px-4 pt-3 pb-1">
                <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft size={18} />
                    <span className="font-medium">Back to Profile</span>
                </button>
            </div>

            {/* Cover Photo */}
            <div className="relative w-full h-[220px] bg-gray-800">
                <Image
                    src={seller?.shop?.coverBanner || "https://ik.imagekit.io/fzoxzwtey/cover/1200%20x%20300.svg?updatedAt=1"}
                    alt="Cover"
                    fill
                    className="object-cover"
                />
                {coverPending && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm">Uploading...</span>
                    </div>
                )}
                <label
                    htmlFor="coverPicker"
                    className="absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm border border-gray-600 transition-all cursor-pointer"
                >
                    <Pencil size={14} /> Edit Cover
                </label>
                <input
                    id="coverPicker"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] || null, "cover")}
                />
            </div>

            {/* Main Card */}
            <div className="w-[90%] lg:w-[60%] mx-auto mt-[-40px] relative z-10">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6">

                    {/* Avatar */}
                    <div className="flex items-end gap-4 mb-6">
                        <div className="relative w-[90px] h-[90px] rounded-full border-4 border-gray-700 overflow-hidden bg-gray-900 flex-shrink-0">
                            <Image
                                src={seller?.shop?.avatar_image || "https://ik.imagekit.io/rikhtamenahil/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.avif"}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                            {avatarPending && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-[10px]">Uploading</span>
                                </div>
                            )}
                            <label
                                htmlFor="avatarPicker"
                                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                            >
                                <Pencil size={18} className="text-white" />
                            </label>
                            <input
                                id="avatarPicker"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e.target.files?.[0] || null, "avatar")}
                            />
                        </div>
                        <div>
                            <p className="text-white font-semibold">{seller?.shop?.name || "Shop Name"}</p>
                            <p className="text-gray-400 text-xs mt-1">Click avatar or cover to change</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-5">

                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-sm">Shop Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your shop name"
                                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-sm">Bio</label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder="Tell customers about your shop..."
                                rows={3}
                                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-sm">Address</label>
                            <input
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Shop address"
                                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-sm">Opening Hours</label>
                            <input
                                name="opening_hours"
                                value={form.opening_hours}
                                onChange={handleChange}
                                placeholder="e.g. Mon - Sat: 9 AM - 6 PM"
                                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-sm">Website</label>
                            <input
                                name="website"
                                value={form.website}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <label className="text-gray-400 text-sm">Social Links</label>
                                <button
                                    onClick={addSocialLink}
                                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition"
                                >
                                    <Plus size={14} /> Add Link
                                </button>
                            </div>

                            {socialLinks.map((link, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {/* Platform selector */}
                                    <select
                                        value={link.name}
                                        onChange={(e) => updateSocialLink(index, "name", e.target.value)}
                                        className="bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition w-[140px] flex-shrink-0"
                                    >
                                        {SOCIAL_PLATFORMS.map((p) => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>

                                    {/* URL input */}
                                    <input
                                        value={link.url}
                                        onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                        placeholder={`https://${link.name.toLowerCase()}.com/yourpage`}
                                        className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition flex-1"
                                    />

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeSocialLink(index)}
                                        className="text-red-400 hover:text-red-300 transition flex-shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={() => updateProfile()}
                            disabled={isPending}
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm"
                        >
                            <Save size={16} />
                            {isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;