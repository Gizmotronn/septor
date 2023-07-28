import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    return (
        <p>fuck you</p>
    )
}