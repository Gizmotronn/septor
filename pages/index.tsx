import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";
import PromptForm from "../components/Proompts/PromptCheck";
import ChatGPTComponent from "../components/Proompts/ChatConnection";
import GptBot from "../components/Proompts/Message";
import Login from "./login";
import PromptCheckPage from "./tests/PromptCheck";
import ChatWithGpt2 from "../components/Core/GptUpsert";
import UserQueriesTable from "../components/Proompts/ProomptList";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    const [scamMessage, setScamMessage] = useState<string | null>(null);

    // Callback function to receive the message from ScamChecker and pass it to ChatWithGpt
    const handleMessageFromScamChecker = (message: string) => {
        setScamMessage(message);
    };

    if (session) {
        return (
            <>
                <PromptCheckPage />
                <UserQueriesTable />
            </>
        )
    }

    return (
        <Login />
    )
}