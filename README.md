# ConfluenceChatbot

The aim of this chatbot is to harness LLM (specifically GPT through the GPT API), to allow participants of a Confluence space to ask queries about the content within there. It uses the Confluence API to obtain the necessary documentation which is provided to paper-qa. Users can then ask queries and the chatbot can respond having taken the context of the documents into account.

This is a proof of concept and the actual project should address data confidentiality concerns. The ideal approach would use a local language model instead of the GPT API such as the LLama model.
