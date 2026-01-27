import {Tag} from "@/lib/types";
import {create} from "zustand/react";

type TagStore = {
    tags: Tag[];
    setTags: (tags: Tag[]) => void;
    getTagBySlug: (slug: string) => Tag | undefined;   
}

export const useTagStore = create<TagStore>((set, get) => ({
    tags: [],
    setTags: (tags: Tag[]) => set({tags}),
    getTagBySlug: (slug: string) => {
        const {tags} = get();
        return tags.find(tag => tag.slug === slug);
    }
}))