<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Services\QrcodeGenerate;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     *
     *
     * @param string $page
     * @return \Illuminate\View\View
     */
    public function show(string $id = null)
    {
        if (filled($id)) {
            $menu = Menu::with(['groups.drinks', 'user'])->findOrFail($id);
            $qrcode = (new QrcodeGenerate())->setListId($id)->setSize(QrcodeGenerate::SIZE_SMALL)->generate();

            return view('menu', compact('qrcode', 'menu'));
        }

        $lists = Menu::with('user')->get();

        return view('menus', ['menus' => $lists]);
    }

    public function index()
    {
    }
}
