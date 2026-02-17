import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const messageSlice = createSlice({
    name: 'message',
    initialState: [
        // {
        //     id: 1,
        //     type: 'success',
        //     title: 'success',
        //     text: 'test'
        // }
    ],
    reducers: {
        createMessage(state, action) {
            state.push({
                id: action.payload.id,
                type: action.payload.success ? 'success' : 'danger',
                title: action.payload.success ? 'success' : 'failed',
                text: action.payload.message
            });
        },
        removeMessage(state, action) {
            const index = state.findIndex(message => message.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        }
    }
});

export const createAsyncMessage = createAsyncThunk(
    'message/createAsyncMessage',
    async (payload, { dispatch, requestId }) => {
        dispatch(createMessage({
            ...payload,
            id: requestId,
        }));

        setTimeout(() => {
            dispatch(removeMessage(requestId));
        }, 2000);
    },
)

export const { createMessage, removeMessage } = messageSlice.actions;

export default messageSlice.reducer;